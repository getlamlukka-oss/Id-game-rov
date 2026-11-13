import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function bangkokDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) return NextResponse.json({ error: 'Missing Supabase service configuration' }, { status: 503 })

  const supabase = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  const reportDate = bangkokDate()
  const { data: settings, error: settingsError } = await supabase.from('automation_settings').select('user_id,discord_enabled,discord_webhook_url').eq('report_enabled', true)
  if (settingsError) return NextResponse.json({ error: settingsError.message }, { status: 500 })

  let processed = 0
  for (const setting of settings || []) {
    const [{ count: accountCount }, { data: events }] = await Promise.all([
      supabase.from('game_accounts').select('id', { count: 'exact', head: true }).eq('user_id', setting.user_id),
      supabase.from('automation_events').select('event_type').eq('user_id', setting.user_id).gte('created_at', `${reportDate}T00:00:00+07:00`).lt('created_at', `${reportDate}T23:59:59+07:00`),
    ])
    const eventCounts = (events || []).reduce<Record<string, number>>((result, event) => { result[event.event_type] = (result[event.event_type] || 0) + 1; return result }, {})
    const summary = { date: reportDate, total_accounts: accountCount || 0, events: eventCounts }
    const { data: report, error: reportError } = await supabase.from('scheduled_reports').upsert({ user_id: setting.user_id, report_date: reportDate, status: 'generated', summary }, { onConflict: 'user_id,report_date' }).select('id').single()
    if (reportError || !report) continue

    let sent = false
    if (setting.discord_enabled && setting.discord_webhook_url) {
      const response = await fetch(setting.discord_webhook_url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ username: 'ROV ID Manager', embeds: [{ title: `รายงาน ROV ประจำวันที่ ${reportDate}`, color: 0xd9f36a, fields: [{ name: 'ไอดีทั้งหมด', value: String(accountCount || 0), inline: true }, { name: 'เพิ่ม', value: String(eventCounts['account.created'] || 0), inline: true }, { name: 'แก้ไข', value: String(eventCounts['account.updated'] || 0), inline: true }, { name: 'ลบ', value: String(eventCounts['account.deleted'] || 0), inline: true }], footer: { text: 'ส่งอัตโนมัติ · Asia/Bangkok · Summary only' } }] }) })
      sent = response.ok
    }
    await supabase.from('scheduled_reports').update({ status: sent ? 'sent' : 'generated', sent_at: sent ? new Date().toISOString() : null }).eq('id', report.id)
    processed += 1
  }
  return NextResponse.json({ ok: true, date: reportDate, processed })
}
