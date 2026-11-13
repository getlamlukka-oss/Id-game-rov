import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ROV ID Manager',
  description: 'ระบบจัดเก็บและจัดการบัญชีเกม ROV ส่วนตัว',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}
