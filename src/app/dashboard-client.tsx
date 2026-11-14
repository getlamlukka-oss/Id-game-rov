'use client'

import { useMemo, useState, useTransition, type FormEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { createGameAccount, deleteGameAccount, updateGameAccount } from '@/app/actions/accounts'

export type Category = { id: string; name: string; description: string | null; cover_image_path: string | null }
export type Account = { id: string; category_id: string; game_name: string; game_id: string; notes: string | null; image_path: string | null; created_at: string }

type Props = { categories: Category[]; accounts: Account[]; dataError: string | null }
type FormValues = { game_id: string; game_name: string; category_id: string; notes: string }

const mainCategories = ['กรอบ 6', 'กรอบ 7', 'กรอบแอส']
const emptyForm: FormValues = { game_id: '', game_name: '', category_id: '', notes: '' }

const frameArtwork: Record<string, string> = {
  'กรอบ 6': '/account-frames/frame-krob7.webp',
  'กรอบ 7': '/account-frames/frame-krob6.webp',
  'กรอบแอส': '/account-frames/frame-krob-as.webp',
}
const categoryArtwork: Record<string, string> = {
  'บัต Evo': '/category-art/but-evo.webp',
}

export default function DashboardClient({ categories, accounts, dataError }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด')
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด')
  const [formOpen, setFormOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [formValues, setFormValues] = useState<FormValues>(emptyForm)
  const [formError, setFormError] = useState('')
  const [isPending, startTransition] = useTransition()

  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories])
  const playedCount = accounts.filter((account) => categoryById.get(account.category_id) === 'ไอดีเล่นแล้ว').length
  const notPlayedCount = accounts.length - playedCount

  const filteredAccounts = useMemo(() => accounts.filter((account) => {
    const categoryName = categoryById.get(account.category_id) || ''
    const isPlayed = categoryName === 'ไอดีเล่นแล้ว'
    const matchesCategory = categoryFilter === 'ทั้งหมด' || categoryName === categoryFilter
    const matchesStatus = statusFilter === 'ทั้งหมด' || (statusFilter === 'เล่นแล้ว' && isPlayed) || (statusFilter === 'ยังไม่เล่น' && !isPlayed)
    const term = search.trim().toLocaleLowerCase()
    const matchesSearch = !term || [account.game_id, account.game_name, account.notes, categoryName].some((value) => value?.toLocaleLowerCase().includes(term))
    return matchesCategory && matchesStatus && matchesSearch
  }), [accounts, categoryById, categoryFilter, statusFilter, search])

  function openCreateForm() {
    setEditingAccount(null)
    setFormValues({ ...emptyForm, category_id: categories.find((category) => mainCategories.includes(category.name))?.id || categories[0]?.id || '' })
    setFormError('')
    setFormOpen(true)
  }

  function openEditForm(account: Account) {
    setEditingAccount(account)
    setFormValues({ game_id: account.game_id, game_name: account.game_name, category_id: account.category_id, notes: account.notes || '' })
    setFormError('')
    setFormOpen(true)
  }

  function closeForm() {
    if (isPending) return
    setFormOpen(false)
    setEditingAccount(null)
    setFormValues(emptyForm)
    setFormError('')
  }

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError('')
    startTransition(async () => {
      const result = editingAccount
        ? await updateGameAccount(editingAccount.id, formValues)
        : await createGameAccount(formValues)
      if (!result.success) {
        setFormError(result.error)
        return
      }
      setFormOpen(false)
      setEditingAccount(null)
      setFormValues(emptyForm)
      router.refresh()
    })
  }

  function handleDelete(account: Account) {
    const confirmed = window.confirm(`ยืนยันการลบไอดี ${account.game_id} ใช่หรือไม่? การลบนี้ไม่สามารถย้อนกลับได้`)
    if (!confirmed) return
    startTransition(async () => {
      const result = await deleteGameAccount(account.id)
      if (!result.success) {
        window.alert(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <>
      <section className="mt-6 grid grid-cols-3 gap-2 sm:gap-4" aria-label="สรุปบัญชี">
        <Metric label="บัญชีทั้งหมด" value={accounts.length} tone="metric-lime" />
        <Metric label="เล่นแล้ว" value={playedCount} tone="metric-coral" />
        <Metric label="ยังไม่เล่น" value={notPlayedCount} tone="metric-cream" />
      </section>

      <div className="controls-layout">
        <section className="control-panel">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="eyebrow">FIND YOUR ACCOUNT</p>
              <h2 className="section-heading">ค้นหาไอดีเกม</h2>
            </div>
            <span className="result-count" aria-live="polite">{filteredAccounts.length} รายการ</span>
          </div>
          <label className="search-shell">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0"><circle cx="10.8" cy="10.8" r="6.8" fill="none" stroke="currentColor" strokeWidth="2"/><path d="m16 16 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหารหัสไอดี ตัวละคร หรือหมายเหตุ..." aria-label="ค้นหารหัสไอดี ตัวละคร หรือหมายเหตุ" />
            {search && <button type="button" className="clear-search" onClick={() => setSearch('')} aria-label="ล้างคำค้น">×</button>}
          </label>
        </section>

        <section className="control-panel">
          <div className="mb-3">
            <p className="eyebrow">COLLECTION FILTER</p>
            <h2 className="section-heading">ตัวกรองคลังไอดี</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {['ทั้งหมด', ...mainCategories].map((name) => {
              const active = categoryFilter === name
              const count = name === 'ทั้งหมด' ? accounts.length : accounts.filter((account) => categoryById.get(account.category_id) === name).length
              return <button key={name} type="button" onClick={() => setCategoryFilter(name)} className={active ? 'filter-chip active' : 'filter-chip'}><CategoryLabel name={name} /> <span>{count}</span></button>
            })}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-extrabold text-muted">สถานะ</span>
            {['ทั้งหมด', 'เล่นแล้ว', 'ยังไม่เล่น'].map((name) => <button key={name} type="button" onClick={() => setStatusFilter(name)} className={statusFilter === name ? 'status-chip active' : 'status-chip'}>{name}</button>)}
          </div>
        </section>
      </div>

      <section className="category-strip">
        {categories.filter((category) => category.name === 'บัต Evo').map((category) => (
          <button
            key={category.id}
            type="button"
            aria-pressed={categoryFilter === category.name}
            onClick={() => setCategoryFilter(categoryFilter === category.name ? 'ทั้งหมด' : category.name)}
            className={categoryFilter === category.name ? 'special-category-tile active' : 'special-category-tile'}
          >
            <img src={categoryArtwork[category.name]} alt="" className="special-category-art" loading="lazy" />
            <span className="min-w-0 text-left">
              <span className="block text-[9px] font-black tracking-[.16em] text-muted">SPECIAL CATEGORY</span>
              <span className="block text-sm font-black"><CategoryLabel name="บัต Evo" /></span>
              <span className="block text-[10px] font-semibold text-muted">หมวดหมู่พิเศษ · {accounts.filter((account) => account.category_id === category.id).length} บัญชี</span>
            </span>
          </button>
        ))}
      </section>

      <section className="mt-8" aria-labelledby="accounts-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">ACCOUNT LIBRARY</p>
            <h2 id="accounts-heading" className="section-heading">บัญชี ROV</h2>
          </div>
          <button type="button" className="button-primary" onClick={openCreateForm}>＋ เพิ่มไอดี</button>
        </div>
        {dataError ? <div className="state-panel">โหลดข้อมูลไม่สำเร็จ: {dataError}</div> : null}
        {!dataError && filteredAccounts.length === 0 ? (
          <div className="state-panel"><span className="text-3xl">⌕</span><strong>ไม่พบไอดีที่ค้นหา</strong><span className="text-sm text-muted">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</span></div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAccounts.map((account) => {
              const categoryName = categoryById.get(account.category_id) || 'อื่น ๆ'
              const played = categoryName === 'ไอดีเล่นแล้ว'
              const hasAssassinFrame = categoryName === 'กรอบแอส'
              return (
                <article key={account.id} className="account-card">
                  <div className="account-card-main">
                    <div className={`account-avatar-wrap ${hasAssassinFrame ? 'account-avatar-wrap-shimmer' : ''}`}>
                      {account.image_path ? (
                        <img src={account.image_path} alt={`รูปโปรไฟล์ ${account.game_name}`} className="account-avatar-photo" loading="lazy" />
                      ) : (
                        <span className="account-avatar-placeholder" aria-hidden="true">{account.game_name.trim().slice(0, 1).toUpperCase() || 'R'}</span>
                      )}
                      {hasAssassinFrame ? (
                        <>
                          <img src={frameArtwork['กรอบแอส']} alt="" aria-hidden="true" className="account-avatar-frame" loading="lazy" />
                          <span className="account-avatar-shimmer" aria-hidden="true" />
                        </>
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="eyebrow">ROV ACCOUNT</p>
                          <h3 className="mt-1 break-all text-lg font-black tracking-tight">{account.game_id}</h3>
                        </div>
                        <span className={played ? 'account-status played' : 'account-status'}>{played ? 'เล่นแล้ว' : 'ยังไม่เล่น'}</span>
                      </div>
                      <p className="mt-2 min-h-10 text-sm font-semibold leading-5 text-muted">{account.notes || 'ไม่มีรายละเอียดตัวละคร'}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-ink/15 pt-3">
                    <span className="truncate rounded-md bg-cream px-2.5 py-1 text-[11px] font-extrabold"><CategoryLabel name={categoryName} /></span>
                    <span className="truncate text-[10px] font-bold uppercase tracking-wider text-muted">#{account.game_name}</span>
                  </div>
                  <div className="mt-4 flex justify-end gap-2 border-t border-ink/10 pt-3">
                    <button type="button" className="button-card-edit" onClick={() => openEditForm(account)}>แก้ไข</button>
                    <button type="button" className="button-card-delete" onClick={() => handleDelete(account)} disabled={isPending}>ลบ</button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {formOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm() }}>
          <section className="account-modal" role="dialog" aria-modal="true" aria-labelledby="account-form-title">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <p className="eyebrow">ACCOUNT MANAGEMENT</p>
                <h2 id="account-form-title" className="section-heading">{editingAccount ? 'แก้ไขไอดีเกม' : 'เพิ่มไอดีเกม'}</h2>
              </div>
              <button type="button" className="modal-close" onClick={closeForm} aria-label="ปิดหน้าต่าง" disabled={isPending}>×</button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <FormField label="รหัสไอดีเกม" required>
                <input autoFocus required maxLength={120} value={formValues.game_id} onChange={(event) => setFormValues((current) => ({ ...current, game_id: event.target.value }))} placeholder="กรอกรหัสไอดีเกม" />
              </FormField>
              <FormField label="ชื่อตัวละคร / ชื่อบัญชี" required>
                <input required maxLength={120} value={formValues.game_name} onChange={(event) => setFormValues((current) => ({ ...current, game_name: event.target.value }))} placeholder="กรอกชื่อที่ใช้เรียกบัญชี" />
              </FormField>
              <FormField label="หมวดหมู่" required>
                <select required value={formValues.category_id} onChange={(event) => setFormValues((current) => ({ ...current, category_id: event.target.value }))}>
                  <option value="" disabled>เลือกหมวดหมู่</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name === 'ไก่ปอง 810' ? '🎟️ ไก่ปอง 810' : category.name}</option>)}
                </select>
              </FormField>
              <FormField label="หมายเหตุ">
                <textarea rows={3} maxLength={2000} value={formValues.notes} onChange={(event) => setFormValues((current) => ({ ...current, notes: event.target.value }))} placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)" />
              </FormField>
              {formError && <p className="form-error" role="alert">{formError}</p>}
              <div className="mt-1 flex gap-2">
                <button type="button" className="button-modal-cancel" onClick={closeForm} disabled={isPending}>ยกเลิก</button>
                <button type="submit" className="button-primary flex-1" disabled={isPending || categories.length === 0}>{isPending ? 'กำลังบันทึก...' : editingAccount ? 'บันทึกการแก้ไข' : 'เพิ่มบัญชี'}</button>
              </div>
              {categories.length === 0 && <p className="text-xs font-semibold text-muted">ยังไม่มีหมวดหมู่ กรุณาสร้างหมวดหมู่ก่อนเพิ่มบัญชี</p>}
            </form>
          </section>
        </div>
      )}
    </>
  )
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return <label className="form-field"><span>{label}{required ? ' *' : ''}</span>{children}</label>
}

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <article className={`metric-card ${tone}`}><span className="text-[10px] font-black tracking-wide sm:text-xs">{label}</span><strong className="mt-1 block text-2xl font-black leading-none sm:text-3xl">{value}</strong></article>
}

function CategoryLabel({ name }: { name: string }) {
  const image = frameArtwork[name] || categoryArtwork[name]
  return (
    <span className="inline-flex items-center gap-1.5 align-middle">
      {image ? <img src={image} alt="" aria-hidden="true" className="inline-block size-5 shrink-0 object-contain" loading="lazy" /> : null}
      <span>{name === 'ไก่ปอง 810' ? '🎟️ ไก่ปอง 810' : name}</span>
    </span>
  )
}
