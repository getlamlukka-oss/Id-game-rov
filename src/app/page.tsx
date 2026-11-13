import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth' // นำเข้าฟังก์ชัน logout

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: categories, error } = await supabase
    .from('categories')
    .select('*')

  const displayCategories = categories || []

  return (
    <main className="min-h-screen px-4 py-6 sm:px-8 lg:px-12 text-white">
      <div className="mx-auto max-w-7xl">
        <header className="flex items-center justify-between border-b border-white/10 pb-6">
          <a href="/" className="flex items-center gap-3" aria-label="Game ID Manager home">
            <span className="grid size-11 place-items-center rounded-xl bg-violet-500 text-xl shadow-lg shadow-violet-500/20">🎮</span>
            <span>
              <span className="block text-lg font-bold tracking-tight">Game ID Manager</span>
              <span className="block text-xs text-zinc-500">PERSONAL GAME LIBRARY</span>
            </span>
          </a>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-400 sm:block">{user.email}</span>
            <div className="grid size-10 place-items-center rounded-full border border-white/10 bg-zinc-900 text-sm font-semibold uppercase">
              {user.email?.charAt(0) || 'U'}
            </div>
            
            {/* ปุ่ม Logout */}
            <form action={logout}>
              <button type="submit" className="text-sm font-medium text-red-400 hover:text-red-300 transition">
                ออกจากระบบ
              </button>
            </form>
          </div>
        </header>

        <section className="py-10 sm:py-14">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">Your collection</p>
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">คลังไอดีเกมของคุณ</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400 sm:text-base">จัดเก็บ Game ID แยกตามหมวดหมู่ ค้นหาง่าย และเข้าถึงข้อมูลได้จากทุกอุปกรณ์</p>
            </div>
            <button type="button" disabled className="cursor-not-allowed rounded-xl bg-violet-500/40 px-5 py-3 text-sm font-semibold text-white/70" title="ฟีเจอร์นี้จะเปิดใช้งานใน Phase 3">
              + เพิ่มหมวดหมู่ (เร็ว ๆ นี้)
            </button>
          </div>
        </section>

        <section aria-labelledby="categories-heading">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 id="categories-heading" className="text-xl font-semibold">หมวดหมู่เกม</h2>
              <p className="mt-1 text-sm text-zinc-500">
                {error ? <span className="text-red-500">ดึงข้อมูลล้มเหลว: {error.message}</span> : "เชื่อมต่อฐานข้อมูลจริงแล้ว"}
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">
              {displayCategories.length} หมวดหมู่
            </span>
          </div>

          {displayCategories.length === 0 ? (
            <div className="p-10 text-center border border-dashed border-white/20 rounded-2xl">
              <p className="text-zinc-500">ยังไม่มีข้อมูลในฐานข้อมูล (คุณสามารถเพิ่มข้อมูลใน Supabase ได้เลย)</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {displayCategories.map((category: any) => (
                <article key={category.id || category.name} className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/80 transition hover:-translate-y-1 hover:border-violet-400/40">
                  <div className="flex h-36 items-center justify-center bg-zinc-800/50">
                    <span className="text-5xl drop-shadow-lg" aria-hidden="true">{category.icon || '🎮'}</span>
                  </div>
                  <div className="flex items-center justify-between p-5">
                    <div>
                      <h3 className="font-semibold">{category.name}</h3>
                      <p className="mt-1 text-sm text-zinc-500">{category.count || 0} game IDs</p>
                    </div>
                    <span className="grid size-9 place-items-center rounded-full bg-white/[0.06] text-zinc-300 transition group-hover:bg-violet-500 group-hover:text-white" aria-hidden="true">↗</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">เริ่มต้นจัดระเบียบไอดีเกม</h2>
              <p className="mt-1 text-sm text-zinc-500">ขั้นตอนถัดไปจะเพิ่มระบบสมัครสมาชิกและเชื่อมต่อฐานข้อมูลส่วนตัวของคุณ</p>
            </div>
            <span className="w-fit rounded-lg border border-violet-400/20 bg-violet-400/10 px-3 py-2 text-xs font-medium text-violet-200">Phase 1 · Project Setup</span>
          </div>
        </section>

        <footer className="py-10 text-center text-xs text-zinc-600">Game ID Manager · Personal Edition</footer>
      </div>
    </main>
  )
}
