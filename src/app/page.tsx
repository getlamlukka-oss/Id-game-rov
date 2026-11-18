import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'
import DashboardMinimal, { type Account, type Category } from './dashboard-minimal'

export const dynamic = 'force-dynamic'

const ACCOUNT_PAGE_SIZE = 40

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const [{ data: categories, error: categoriesError }, { data: accounts, error: accountsError, count: totalAccounts }, { count: playedAccounts }] = await Promise.all([
    supabase.from('categories').select('id,name,description,cover_image_path').order('name'),
    supabase.from('game_accounts').select('id,category_id,game_name,game_id,notes,image_path,created_at,status', { count: 'exact' }).order('created_at', { ascending: false }).order('id', { ascending: false }).range(0, ACCOUNT_PAGE_SIZE - 1),
    supabase.from('game_accounts').select('id', { count: 'exact', head: true }).eq('status', 'played'),
  ])
  const categoryCounts = await Promise.all((categories || []).map(async category => {
    const { count } = await supabase.from('game_accounts').select('id', { count: 'exact', head: true }).eq('category_id', category.id)
    return [category.id, count || 0] as const
  }))
  const imagePaths = (accounts || []).flatMap(account => account.image_path && !account.image_path.startsWith('http') ? [account.image_path] : [])
  const { data: signedImages } = imagePaths.length
    ? await supabase.storage.from('game-images').createSignedUrls(imagePaths, 60 * 60)
    : { data: [] }
  const signedImageMap = new Map((signedImages || []).map(image => [image.path, image.signedUrl]))
  const accountsWithImages = (accounts || []).map(account => {
    if (!account.image_path || account.image_path.startsWith('http')) return account
    return { ...account, image_path: signedImageMap.get(account.image_path) || null }
  })
  return <main className="min-h-screen"><div className="mx-auto max-w-5xl px-4 pb-10 pt-3 sm:px-6 sm:pt-5">
    <header className="site-header flex items-center justify-between gap-3">
      <Link href="/" className="flex min-w-0 items-center gap-2.5" aria-label="ROV ID Manager"><span className="brand-mark" aria-hidden="true"><span className="brand-mark-dot" /></span><span><span className="block text-base font-bold">ROV ID Manager</span><span className="block text-[10px] text-muted">จัดการบัญชีของคุณ</span></span></Link>
      <div className="flex shrink-0 items-center gap-2"><Link href="/automation" className="button-quiet">Automation</Link><span className="user-avatar" title={user.email||'ผู้ใช้'}>{user.email?.slice(0,1).toUpperCase()||'U'}</span><form action={logout}><button className="button-quiet" type="submit">ออกจากระบบ</button></form></div>
    </header>
    <DashboardMinimal categories={(categories||[]) as Category[]} accounts={accountsWithImages as Account[]} totalAccounts={totalAccounts||0} playedAccounts={playedAccounts||0} categoryCounts={Object.fromEntries(categoryCounts)} hasMore={(accounts||[]).length===ACCOUNT_PAGE_SIZE} dataError={categoriesError?.message||accountsError?.message||null}/>
    <footer className="mt-10 border-t border-ink/10 pt-4 text-center text-[11px] text-muted">ROV ID MANAGER · PRIVATE COLLECTION</footer>
  </div></main>
}
