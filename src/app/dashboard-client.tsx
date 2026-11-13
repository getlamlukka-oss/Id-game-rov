'use client'

import { useMemo, useState } from 'react'

export type Category = { id: string; name: string; description: string | null; cover_image_path: string | null }
export type Account = { id: string; category_id: string; game_name: string; game_id: string; notes: string | null; image_path: string | null; created_at: string }

type Props = { categories: Category[]; accounts: Account[]; dataError: string | null }

const mainCategories = ['กรอบ 6', 'กรอบ 7', 'กรอบแอส']

export default function DashboardClient({ categories, accounts, dataError }: Props) {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ทั้งหมด')
  const [statusFilter, setStatusFilter] = useState('ทั้งหมด')

  const categoryById = useMemo(() => new Map(categories.map((category) => [category.id, category.name])), [categories])
  const playedCount = accounts.filter((account) => categoryById.get(account.category_id) === 'ไอดีเล่นแล้ว').length
  const roundZeroCount = accounts.length - playedCount

  const filteredAccounts = useMemo(() => accounts.filter((account) => {
    const categoryName = categoryById.get(account.category_id) || ''
    const isPlayed = categoryName === 'ไอดีเล่นแล้ว'
    const matchesCategory = categoryFilter === 'ทั้งหมด' || categoryName === categoryFilter
    const matchesStatus = statusFilter === 'ทั้งหมด' || (statusFilter === 'เล่นแล้ว' && isPlayed) || (statusFilter === 'รอบ 0' && !isPlayed)
    const term = search.trim().toLocaleLowerCase()
    const matchesSearch = !term || [account.game_id, account.game_name, account.notes, categoryName].some((value) => value?.toLocaleLowerCase().includes(term))
    return matchesCategory && matchesStatus && matchesSearch
  }), [accounts, categoryById, categoryFilter, statusFilter, search])

  return (
    <>
      <section className="mt-6 grid grid-cols-3 gap-2 sm:gap-4" aria-label="สรุปบัญชี">
        <Metric label="บัญชีทั้งหมด" value={accounts.length} tone="metric-lime" />
        <Metric label="เล่นแล้ว" value={playedCount} tone="metric-coral" />
        <Metric label="รอบ 0" value={roundZeroCount} tone="metric-cream" />
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">FIND YOUR ACCOUNT</p>
            <h2 className="section-heading">ค้นหาไอดีเกม</h2>
          </div>
          <span className="text-xs font-bold text-muted">{filteredAccounts.length} รายการ</span>
        </div>
        <label className="search-shell">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0"><circle cx="10.8" cy="10.8" r="6.8" fill="none" stroke="currentColor" strokeWidth="2"/><path d="m16 16 5 5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหารหัสบัญชีหรือตัวละคร..." aria-label="ค้นหารหัสบัญชีหรือตัวละคร" />
          {search && <button type="button" className="clear-search" onClick={() => setSearch('')} aria-label="ล้างคำค้น">×</button>}
        </label>
      </section>

      <section className="mt-7">
        <div className="mb-3">
          <p className="eyebrow">COLLECTION FILTER</p>
          <h2 className="section-heading">เลือกหมวดหมู่</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {['ทั้งหมด', ...mainCategories].map((name) => {
            const active = categoryFilter === name
            const count = name === 'ทั้งหมด' ? accounts.length : accounts.filter((account) => categoryById.get(account.category_id) === name).length
            return <button key={name} type="button" onClick={() => setCategoryFilter(name)} className={active ? 'filter-chip active' : 'filter-chip'}>{name}<span>{count}</span></button>
          })}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-extrabold text-muted">สถานะ</span>
          {['ทั้งหมด', 'เล่นแล้ว', 'รอบ 0'].map((name) => <button key={name} type="button" onClick={() => setStatusFilter(name)} className={statusFilter === name ? 'status-chip active' : 'status-chip'}>{name}</button>)}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="accounts-heading">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">ACCOUNT LIBRARY</p>
            <h2 id="accounts-heading" className="section-heading">บัญชี ROV</h2>
          </div>
          <span className="rounded-lg border-2 border-ink bg-white px-2.5 py-1 text-[11px] font-black">{filteredAccounts.length} / {accounts.length}</span>
        </div>
        {dataError ? <div className="state-panel">โหลดข้อมูลไม่สำเร็จ: {dataError}</div> : null}
        {!dataError && filteredAccounts.length === 0 ? (
          <div className="state-panel"><span className="text-3xl">⌕</span><strong>ไม่พบไอดีที่ค้นหา</strong><span className="text-sm text-muted">ลองเปลี่ยนคำค้นหาหรือตัวกรอง</span></div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredAccounts.map((account) => {
              const categoryName = categoryById.get(account.category_id) || 'อื่น ๆ'
              const played = categoryName === 'ไอดีเล่นแล้ว'
              return (
                <article key={account.id} className="account-card">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="eyebrow">ROV ACCOUNT</p>
                      <h3 className="mt-1 break-all text-lg font-black tracking-tight">{account.game_id}</h3>
                    </div>
                    <span className={played ? 'account-status played' : 'account-status'}>{played ? 'เล่นแล้ว' : 'รอบ 0'}</span>
                  </div>
                  <p className="mt-3 min-h-10 text-sm font-semibold leading-5 text-muted">{account.notes || 'ไม่มีรายละเอียดตัวละคร'}</p>
                  <div className="mt-4 flex items-center justify-between gap-2 border-t border-ink/15 pt-3">
                    <span className="truncate rounded-md bg-cream px-2.5 py-1 text-[11px] font-extrabold">{categoryName === 'ไก่ปอง 810' ? '🎟️ ไก่ปอง 810' : categoryName}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted">#{account.game_name}</span>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </>
  )
}

function Metric({ label, value, tone }: { label: string; value: number; tone: string }) {
  return <article className={`metric-card ${tone}`}><span className="text-[10px] font-black tracking-wide sm:text-xs">{label}</span><strong className="mt-1 block text-2xl font-black leading-none sm:text-3xl">{value}</strong></article>
}
