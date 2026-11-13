'use client'

import { useState } from 'react'
import { createWorkflow, saveAutomationSettings } from '@/app/actions/automation'

type Settings = { report_enabled: boolean; report_time: string; discord_enabled: boolean; discord_webhook_url: string } | null
type Workflow = { id: string; name: string; description: string | null; enabled: boolean; trigger_type: string; action_type: string; created_at: string }
type Event = { id: string; event_type: string; payload: Record<string, unknown>; created_at: string }

export default function AutomationClient({ settings, workflows, events, disabled }: { settings: Settings; workflows: Workflow[]; events: Event[]; disabled: boolean }) {
  const [reportEnabled, setReportEnabled] = useState(settings?.report_enabled ?? true)
  const [reportTime, setReportTime] = useState((settings?.report_time || '18:00').slice(0, 5))
  const [discordEnabled, setDiscordEnabled] = useState(settings?.discord_enabled ?? false)
  const [webhook, setWebhook] = useState('')
  const [name, setName] = useState('')
  const [keyword, setKeyword] = useState('')
  const [tagName, setTagName] = useState('')
  const [fieldName, setFieldName] = useState('notes')
  const [status, setStatus] = useState('')
  const [saving, setSaving] = useState(false)

  async function saveSettings() {
    setSaving(true); setStatus('')
    const result = await saveAutomationSettings({ report_enabled: reportEnabled, report_time: reportTime, discord_enabled: discordEnabled, discord_webhook_url: webhook })
    setStatus(result.success ? 'บันทึกการตั้งค่าแล้ว' : result.error)
    setSaving(false)
  }

  async function addWorkflow(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setStatus('')
    const result = await createWorkflow({ name, keyword, tagName, fieldName })
    setStatus(result.success ? 'สร้าง Workflow แล้ว' : result.error)
    if (result.success) { setName(''); setKeyword(''); setTagName('') }
    setSaving(false)
  }

  return <>
    <section className="automation-grid mt-6">
      <article className="automation-card automation-card-lime">
        <div className="eyebrow">01 / DAILY REPORT ENGINE</div>
        <h2 className="automation-title">รายงานประจำวัน</h2>
        <p className="automation-copy">สรุปจำนวนไอดี, กิจกรรมล่าสุด และการเปลี่ยนแปลงของวันนั้น ส่งทุกวันตามเวลาไทย</p>
        <div className="automation-form-row"><label className="toggle-row"><input type="checkbox" checked={reportEnabled} onChange={e => setReportEnabled(e.target.checked)} disabled={disabled} /><span>เปิดใช้งานรายงาน</span></label><label className="form-field compact-field">เวลาไทย<input type="time" value={reportTime} onChange={e => setReportTime(e.target.value)} disabled={disabled || !reportEnabled} /></label></div>
        <div className="automation-note">ตั้งค่าแล้ว: ทุกวันเวลา {reportTime} น. · Asia/Bangkok</div>
      </article>

      <article className="automation-card automation-card-coral">
        <div className="eyebrow">02 / DISCORD DELIVERY</div>
        <h2 className="automation-title">Discord Summary-only</h2>
        <p className="automation-copy">ส่งเฉพาะรายงานสรุป ไม่ส่งกิจกรรมเพิ่ม/แก้ไข/ลบแบบเรียลไทม์ และ Webhook จะไม่ถูกแสดงกลับหลังบันทึก</p>
        <label className="toggle-row"><input type="checkbox" checked={discordEnabled} onChange={e => setDiscordEnabled(e.target.checked)} disabled={disabled} /><span>เปิดส่งรายงานเข้า Discord</span></label>
        <label className="form-field compact-field mt-3">Discord Webhook URL<input type="password" value={webhook} onChange={e => setWebhook(e.target.value)} placeholder="https://discord.com/api/webhooks/..." disabled={disabled || !discordEnabled} autoComplete="new-password" /></label>
        <div className="automation-note">ความปลอดภัย: ใส่ในช่องนี้เท่านั้น ห้าม commit ลง GitHub</div>
      </article>
    </section>

    <section className="automation-grid mt-4">
      <article className="automation-card">
        <div className="eyebrow">03 / WORKFLOW BUILDER</div><h2 className="automation-title">สร้างกฎ Auto-tag</h2><p className="automation-copy">เมื่อ game ID, ชื่อตัวละคร หรือโน้ตมีคีย์เวิร์ด ระบบจะติดแท็กให้อัตโนมัติหลังบันทึกไอดี</p>
        <form onSubmit={addWorkflow} className="workflow-form">
          <label className="form-field">ชื่อ Workflow<input value={name} onChange={e => setName(e.target.value)} placeholder="เช่น ไอดีแรงค์สูง" disabled={disabled} /></label>
          <div className="workflow-fields"><label className="form-field">ตรวจจาก<select value={fieldName} onChange={e => setFieldName(e.target.value)} disabled={disabled}><option value="notes">โน้ต</option><option value="game_name">ชื่อตัวละคร</option><option value="game_id">รหัสไอดี</option></select></label><label className="form-field">มีคำว่า<input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="เช่น Master" disabled={disabled} /></label><label className="form-field">ติดแท็ก<input value={tagName} onChange={e => setTagName(e.target.value)} placeholder="เช่น RANK-MASTER" disabled={disabled} /></label></div>
          <button className="button-primary" disabled={disabled || saving}>{saving ? 'กำลังบันทึก...' : 'สร้าง Workflow'}</button>
        </form>
      </article>

      <article className="automation-card">
        <div className="eyebrow">04 / LIVE CONFIG</div><h2 className="automation-title">Workflow ที่เปิดใช้งาน</h2>
        {workflows.length ? <div className="workflow-list">{workflows.map(workflow => <div className="workflow-item" key={workflow.id}><span className="workflow-dot" /><div><strong>{workflow.name}</strong><p>{workflow.description || 'Auto-tag rule'}</p></div><span className="workflow-status">{workflow.enabled ? 'ON' : 'OFF'}</span></div>)}</div> : <div className="state-panel compact-state">ยังไม่มี Workflow · สร้างกฎแรกทางซ้าย</div>}
      </article>
    </section>

    <section className="automation-card mt-4"><div className="flex flex-wrap items-end justify-between gap-3"><div><div className="eyebrow">05 / EVENT STREAM</div><h2 className="automation-title">Activity log</h2></div><button className="button-primary" onClick={saveSettings} disabled={disabled || saving}>{saving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่าทั้งหมด'}</button></div>{status && <div className="automation-toast mt-3" role="status">{status}</div>}{events.length ? <div className="event-list">{events.map(event => <div className="event-item" key={event.id}><span className="event-type">{event.event_type}</span><span className="event-payload">{String(event.payload?.game_name || event.payload?.game_id || 'account event')}</span><time>{new Date(event.created_at).toLocaleString('th-TH')}</time></div>)}</div> : <div className="state-panel compact-state mt-4">ยังไม่มี Event log · เมื่อ migration เสร็จ กิจกรรมจะถูกบันทึกอัตโนมัติ</div>}</section>
  </>
}
