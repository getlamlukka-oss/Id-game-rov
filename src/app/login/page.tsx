import { login } from '@/app/actions/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const errorMessage = params.message as string

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-950 text-white">
      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900/80 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-violet-500 text-2xl shadow-lg shadow-violet-500/20">🎮</span>
          <h1 className="text-2xl font-bold">ยินดีต้อนรับกลับมา</h1>
          <p className="mt-2 text-sm text-zinc-400">เข้าสู่ระบบเพื่อจัดการคลังไอดีเกมของคุณ</p>
        </div>

        {/* แสดงข้อความ Error ถ้ามีการ Login ผิดพลาด */}
        {errorMessage && (
          <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
            {errorMessage}
          </div>
        )}

        <form action={login} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300" htmlFor="email">อีเมล</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="อีเมล"
              className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300" htmlFor="password">รหัสผ่าน</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="รหัสผ่าน"
              className="w-full rounded-xl border border-white/10 bg-zinc-800 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
          </div>
          <button type="submit" className="mt-2 w-full rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-zinc-900">
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </main>
  )
}
