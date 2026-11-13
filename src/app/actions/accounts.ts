'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type AccountInput = {
  game_id: string
  game_name: string
  category_id: string
  notes: string
}

function validateInput(input: AccountInput) {
  const game_id = input.game_id?.trim()
  const game_name = input.game_name?.trim()
  const category_id = input.category_id?.trim()
  const notes = input.notes?.trim() || ''

  if (!game_id || !game_name || !category_id) {
    return { error: 'กรุณากรอกรหัสไอดี ชื่อตัวละคร และเลือกหมวดหมู่ให้ครบ' }
  }
  if (game_id.length > 120 || game_name.length > 120 || notes.length > 2000) {
    return { error: 'ข้อมูลยาวเกินกำหนด กรุณาตรวจสอบอีกครั้ง' }
  }
  return { value: { game_id, game_name, category_id, notes } }
}

export async function createGameAccount(input: AccountInput) {
  const validation = validateInput(input)
  if ('error' in validation) return { success: false as const, error: validation.error }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false as const, error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' }

  const { error } = await supabase.from('game_accounts').insert({
    ...validation.value,
    user_id: user.id,
    image_path: null,
  })

  if (error) return { success: false as const, error: 'บันทึกไม่สำเร็จ: ' + error.message }
  revalidatePath('/')
  return { success: true as const }
}

export async function updateGameAccount(accountId: string, input: AccountInput) {
  const validation = validateInput(input)
  if (!validation.value) return { success: false as const, error: validation.error }

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
  revalidatePath('/')
  return { success: true as const }
}
