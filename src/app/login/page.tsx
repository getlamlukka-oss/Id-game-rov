import { login } from '@/app/actions/auth'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const errorMessage = params.message as string

  return (
    <main className="login-page flex min-h-screen flex-col items-center justify-center p-4">
      <section className="login-card">
        <header className="mb-8 text-center">
          <span className="login-mark" aria-hidden="true">R</span>
          <p className="eyebrow mb-2">PRIVATE GAME LIBRARY</p>
          <h1>ยินดีต้อนรับกลับมา</h1>
          <p className="login-subtitle">เข้าสู่ระบบเพื่อจัดการคลังบัญชี RoV ของคุณ</p>
        </header>

        {errorMessage && (
          <div className="login-error mb-4" role="alert">{errorMessage}</div>
        )}

        <form action={login} className="flex flex-col gap-4">
          <label className="login-field" htmlFor="email">
            <span>อีเมล</span>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="name@example.com" />
          </label>
          <label className="login-field" htmlFor="password">
            <span>รหัสผ่าน</span>
            <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="กรอกรหัสผ่าน" />
          </label>
          <button type="submit" className="login-submit mt-2 w-full">เข้าสู่ระบบ</button>
        </form>
        <p className="mt-7 text-center text-[10px] tracking-[.16em] text-[#aaa99e]">ROV ID MANAGER · PRIVATE COLLECTION</p>
      </section>
    </main>
  )
}
