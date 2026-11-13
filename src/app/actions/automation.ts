'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type SettingsInput = {
  report_enabled: boolean
  report_time: string
  discord_enabled: boolean
  discord_webhook_url: string
}

export async function saveAutomationSettings(input: SettingsInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false as const, error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' }

  const reportTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(input.report_time) ? input.report_time : '18:00'
  const webhook = input.discord_webhook_url.trim()
  if (webhook && !/^https:\/\/discord(?:app)?\.com\/api\/webhooks\//.test(webhook)) {
    return { success: false as const, error: 'Discord Webhook URL ไม่ถูกต้อง' }
  }

  const { error } = await supabase.from('automation_settings').upsert({
    user_id: user.id,
    report_enabled: input.report_enabled,
    report_time: reportTime + ':00',
    report_timezone: 'Asia/Bangkok',
    discord_enabled: input.discord_enabled && Boolean(webhook),
    discord_webhook_url: webhook || null,
    discord_summary_only: true,
    updated_at: new Date().toISOString(),
  })
  if (error) return { success: false as const, error: 'บันทึกการตั้งค่าไม่สำเร็จ: ' + error.message }
  revalidatePath('/automation')
  return { success: true as const }
}

export async function createWorkflow(input: { name: string; keyword: string; tagName: string; fieldName: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false as const, error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' }
  const name = input.name.trim().slice(0, 120)
  const keyword = input.keyword.trim().slice(0, 120)
  const tagName = input.tagName.trim().slice(0, 60)
  if (!name || !keyword || !tagName) return { success: false as const, error: 'กรอกชื่อ Workflow, คีย์เวิร์ด และชื่อแท็กให้ครบ' }

  const { data: workflow, error: workflowError } = await supabase.from('automation_workflows').insert({
    user_id: user.id,
    name,
    description: `ติดแท็กอัตโนมัติเมื่อ ${input.fieldName} มีคำว่า ${keyword}`,
    trigger_type: 'account.created_or_updated',
    action_type: 'auto_tag',
    config: { field_name: input.fieldName },
  }).select('id').single()
  if (workflowError || !workflow) return { success: false as const, error: 'สร้าง Workflow ไม่สำเร็จ: ' + (workflowError?.message || 'ไม่พบข้อมูล') }

  const { error: ruleError } = await supabase.from('automation_rules').insert({
    workflow_id: workflow.id,
    field_name: input.fieldName,
    operator: 'contains',
    value: keyword,
    tag_name: tagName,
  })
  if (ruleError) return { success: false as const, error: 'สร้างกฎไม่สำเร็จ: ' + ruleError.message }
  revalidatePath('/automation')
  return { success: true as const }
}
