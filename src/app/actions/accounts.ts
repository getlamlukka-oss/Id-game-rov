'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type AccountInput = {
  game_id: string
  game_name: string
  category_id: string
  notes: string
}

type ValidationResult =
  | { valid: true; value: AccountInput }
  | { valid: false; error: string }

function validateInput(input: AccountInput): ValidationResult {
  const game_id = input.game_id?.trim()
  const game_name = input.game_name?.trim()
  const category_id = input.category_id?.trim()
  const notes = input.notes?.trim() || ''

  if (!game_id || !game_name || !category_id) {
    return { valid: false, error: 'กรุณากรอกรหัสไอดี ชื่อตัวละคร และเลือกหมวดหมู่ให้ครบ' }
  }
  if (game_id.length > 120 || game_name.length > 120 || notes.length > 2000) {
    return { valid: false, error: 'ข้อมูลยาวเกินกำหนด กรุณาตรวจสอบอีกครั้ง' }
  }
  return { valid: true, value: { game_id, game_name, category_id, notes } }
}

export async function createGameAccount(input: AccountInput) {
  const validation = validateInput(input)
  if (!validation.valid) return { success: false as const, error: validation.error }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false as const, error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' }

  const { data: created, error } = await supabase.from('game_accounts').insert({
    ...validation.value,
    user_id: user.id,
    image_path: null,
  }).select('id').single()

  if (error) return { success: false as const, error: 'บันทึกไม่สำเร็จ: ' + error.message }
  if (created?.id) await applyAutoTags(supabase, user.id, created.id, validation.value)
  await recordAutomationEvent(supabase, user.id, 'account.created', created?.id || null, validation.value)
  revalidatePath('/')
  return { success: true as const }
}

export async function updateGameAccount(accountId: string, input: AccountInput) {
  const validation = validateInput(input)
  if (!validation.valid) return { success: false as const, error: validation.error }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false as const, error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' }

  const { data, error } = await supabase
    .from('game_accounts')
    .update(validation.value)
    .eq('id', accountId)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()

  if (error) return { success: false as const, error: 'แก้ไขไม่สำเร็จ: ' + error.message }
  if (!data) return { success: false as const, error: 'ไม่พบบัญชีนี้ หรือไม่มีสิทธิ์แก้ไข' }
  await applyAutoTags(supabase, user.id, accountId, validation.value)
  await recordAutomationEvent(supabase, user.id, 'account.updated', accountId, validation.value)
  revalidatePath('/')
  return { success: true as const }
}

export async function deleteGameAccount(accountId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false as const, error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' }

  const { data, error } = await supabase
    .from('game_accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()

  if (error) return { success: false as const, error: 'ลบไม่สำเร็จ: ' + error.message }
  if (!data) return { success: false as const, error: 'ไม่พบบัญชีนี้ หรือไม่มีสิทธิ์ลบ' }
  await recordAutomationEvent(supabase, user.id, 'account.deleted', accountId, { account_id: accountId })
  revalidatePath('/')
  return { success: true as const }
}

// Optional until the Automation Center migration is installed.
async function recordAutomationEvent(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, eventType: string, accountId: string | null, payload: Record<string, unknown>) {
  await supabase.from('automation_events').insert({ user_id: userId, event_type: eventType, account_id: accountId, payload })
}

async function applyAutoTags(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, accountId: string, account: AccountInput) {
  const { data: workflows } = await supabase.from('automation_workflows').select('id').eq('user_id', userId).eq('enabled', true).eq('action_type', 'auto_tag')
  if (!workflows?.length) return
  const { data: rules } = await supabase.from('automation_rules').select('workflow_id,field_name,operator,value,tag_name').in('workflow_id', workflows.map(workflow => workflow.id))
  for (const rule of rules || []) {
    const field = account[rule.field_name as keyof AccountInput] || ''
    const source = String(field).toLowerCase()
    const value = String(rule.value).toLowerCase()
    const matches = rule.operator === 'equals' ? source === value : rule.operator === 'starts_with' ? source.startsWith(value) : source.includes(value)
    if (!matches) continue
    const { data: tag } = await supabase.from('account_tags').upsert({ user_id: userId, name: rule.tag_name }, { onConflict: 'user_id,name' }).select('id').single()
    if (tag) await supabase.from('game_account_tags').upsert({ account_id: accountId, tag_id: tag.id }, { onConflict: 'account_id,tag_id' })
  }
}
