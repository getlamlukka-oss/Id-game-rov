import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AutomationClient from './automation-client'

export const dynamic = 'force-dynamic'

export default async function AutomationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: settings, error: settingsError }, { data: workflows, error: workflowsError }, { data: events, error: eventsError }] = await Promise.all([
    supabase.from('automation_settings').select('report_enabled,report_time,discord_enabled,discord_webhook_url').eq('user_id', user.id).maybeSingle(),
    supabase.from('automation_workflows').select('id,name,description,enabled,trigger_type,action_type,created_at').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('automation_events').select('id,event_type,payload,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(8),
  ])

  const setupNeeded = [settingsError, workflowsError, eventsError].some(Boolean)
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <header className="site-header flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="กลับหน้าหลัก">
            <span className="brand-mark">R</span>
            <span className="min-w-0"><span className="block truncate text-base font-black sm:text-lg">AUTOMATION CENTER</span><span className="block text-[10px] font-bold tracking-[.2em] text-muted">ROV ID OPERATIONS</span></span>
          </Link>
          <Link href="/" className="button-quiet">กลับคลังไอดี</Link>
        </header>

        <section className="hero-panel automation-hero mt-5 overflow-hidden sm:mt-6">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-ink/20 bg-cream/70 px-3 py-1 text-[10px] font-black tracking-[.18em]"><span className="size-2 rounded-full bg-lime" /> CONTROL ROOM</div>
            <h1 className="max-w-2xl text-3xl font-black leading-[1.08] tracking-tight sm:text-5xl">สั่งงานคลังไอดีแบบโปรแกรมเมอร์</h1>
            <p className="mt-3 max-w-xl text-sm font-medium leading-6 text-muted sm:text-base">ตั้ง Workflow, ติดแท็กอัตโนมัติ, สรุปรายงานทุกวัน 18:00 น. และส่งเข้า Discord แบบ Summary-only</p>
          </div>
          <div className="hero-stamp" aria-hidden="true">AUTO<br/><span>OPS</span></div>
        </section>

        {setupNeeded && <div className="automation-warning mt-5"><strong>ต้องติดตั้งฐานข้อมูล Automation ก่อน</strong><span>รันไฟล์ migration ในโฟลเดอร์ supabase/migrations ผ่าน Supabase SQL Editor แล้วกลับมารีเฟรชหน้านี้ ระบบคลังไอดีเดิมยังใช้งานได้ตามปกติ</span></div>}
        <AutomationClient settings={settings} workflows={workflows || []} events={events || []} disabled={setupNeeded} />
      </div>
    </main>
  )
}
