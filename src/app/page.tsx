import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import DashboardClient, { type Account, type Category } from './dashboard-client'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: categories, error: categoriesError }, { data: accounts, error: accountsError }] = await Promise.all([
    supabase.from('categories').select('id,name,description,cover_image_path').order('name'),
    supabase.from('game_accounts').select('id,category_id,game_name,game_id,notes,image_path,created_at').order('created_at', { ascending: false }),
  ])

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-5 sm:px-6 lg:px-8">
        <header className="site-header flex items-center justify-between gap-3">
          <Link href="/" className="flex min-w-0 items-center gap-3" aria-label="ROV ID Manager">
            <span className="brand-mark">R</span>
            <span className="min-w-0">
              <span className="block truncate text-base font-black tracking-tight sm:text-lg">ROV ID MANAGER</span>
              <span className="block text-[10px] font-bold tracking-[.2em] text-muted">PERSONAL GAME VAULT</span>
            </span>
          </Link>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <span className="hidden max-w-44 truncate text-xs font-semibold text-muted sm:block">{user.email}</span>
            <span className="user-avatar">{user.email?.slice(0,1).toUpperCase() || 'U'}</span>
            <form action={logout}>
              <button className="button-quiet" type="submit">ออกจากระบบ</button>
            </form>
          </div>
        </header>

        <section className="hero-panel mt-5 overflow-hidden sm:mt-6">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-ink/20 bg-cream/70 px-3 py-1 text-[10px] font-black tracking-[.18em]">
              <span className="size-2 rounded-full bg-lime" /> YOUR ROV COLLECTION
            </div>
            <h1 className="max-w-xl text-3xl font-black leading-[1.08] tracking-tight sm:text-5xl">คลังไอดีของคุณ</h1>
            <p className="mt-3 max-w-lg text-sm font-medium leading-6 text-muted sm:text-base">ค้นหาและจัดการบัญชี ROV ได้ง่ายขึ้นในที่เดียว</p>
          </div>
          <div className="hero-stamp" aria-hidden="true">ROV<br/><span>ID VAULT</span></div>
        </section>

        <DashboardClient
          categories={(categories || []) as Category[]}
          accounts={(accounts || []) as Account[]}
          dataError={categoriesError?.message || accountsError?.message || null}
        />

        <footer className="mt-12 flex flex-col justify-between gap-2 border-t border-ink/20 pt-5 text-[11px] font-bold text-muted sm:flex-row">
          <span>ROV ID MANAGER · PRIVATE COLLECTION</span>
          <span>YOUR DATA · YOUR CONTROL</span>
        </footer>
      </div>
    </main>
  )
}
