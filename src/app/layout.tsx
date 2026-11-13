import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Game ID Manager',
  description: 'จัดเก็บและจัดหมวดหมู่ Game ID ส่วนตัว',
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
