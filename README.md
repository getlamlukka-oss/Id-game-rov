# ROV ID Manager

เว็บแอปสำหรับจัดเก็บและจัดการบัญชีเกม RoV แบบส่วนตัว ผู้ใช้ต้องเข้าสู่ระบบก่อนเข้าถึงคลังบัญชี ข้อมูลบัญชีถูกจัดเก็บใน Supabase และแยกข้อมูลตามเจ้าของบัญชีผู้ใช้

## ฟีเจอร์

- เข้าสู่ระบบและออกจากระบบด้วย Supabase Auth
- ดูและจัดการบัญชีเกม RoV ในหน้า Dashboard
- เพิ่ม แก้ไข และลบบัญชี
- จัดหมวดหมู่บัญชีผ่านข้อมูลในตาราง `categories`
- แยกสถานะการเล่นเป็น `played` และ `not_played`
- จัดเก็บรูปภาพบัญชีใน Supabase Storage bucket ชื่อ `game-images`
- นำเข้าบัญชีหลายรายการจากข้อมูลที่เตรียมไว้ (สูงสุด 100 รายการต่อครั้ง) พร้อมตรวจรายการซ้ำ
- Automation Center สำหรับตั้ง Workflow และกฎติดแท็กอัตโนมัติ

> หมายเหตุ: ความสามารถ Automation บางส่วนต้องติดตั้ง migration ก่อน ส่วนการส่งรายงานตามเวลา/การส่ง Discord อัตโนมัติจะทำงานได้ก็ต่อเมื่อมีระบบ scheduler หรือ worker ที่เชื่อมต่อการตั้งค่าไว้ด้วย

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase Auth, PostgreSQL และ Storage
- Vercel สำหรับ Deploy

## ความต้องการก่อนเริ่ม

- Node.js เวอร์ชันที่รองรับ Next.js 16
- npm
- โปรเจกต์ Supabase
- สิทธิ์เข้าถึง Repository นี้

## ติดตั้งและรันในเครื่อง

1. Clone repository

   ```bash
   git clone https://github.com/getlamlukka-oss/Id-game-rov.git
   cd Id-game-rov
   ```

2. ติดตั้ง dependencies

   ```bash
   npm install
   ```

3. สร้างไฟล์ `.env.local` ที่ root ของโปรเจกต์

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
   ```

   ใส่ URL และ Publishable key จากหน้า Project Settings > API ของ Supabase ห้าม commit ไฟล์ `.env.local` หรือ secret key ลง Git

4. เริ่ม Development server

   ```bash
   npm run dev
   ```

5. เปิด [http://localhost:3000](http://localhost:3000)

## ตั้งค่า Supabase

แอปนี้อาศัยตารางหลักที่มีอยู่ในฐานข้อมูล ได้แก่

- `game_accounts` — บัญชีเกม โดยมีข้อมูลเจ้าของบัญชี หมวดหมู่ ชื่อเกม ไอดี โน้ต รูปภาพ และสถานะ
- `categories` — หมวดหมู่บัญชี

คอลัมน์สถานะของ `game_accounts` ใช้ค่า `played` หรือ `not_played` ส่วนหมวดหมู่จัดเก็บผ่าน `category_id` แยกจากสถานะ

ก่อนใช้งาน ให้ตรวจสอบว่าโปรเจกต์ Supabase มี schema, Foreign key, Row Level Security (RLS) และ Storage policies ที่สอดคล้องกับแอปแล้ว รวมถึง:

- เปิดใช้ Supabase Auth และสร้างผู้ใช้ที่ได้รับอนุญาต
- ตั้งค่า RLS ให้ผู้ใช้เข้าถึงเฉพาะแถวข้อมูลของตนเอง
- สร้าง Storage bucket ชื่อ `game-images` และกำหนด Storage policies ให้จำกัดการเข้าถึงตามเจ้าของบัญชี
- ตรวจสอบว่าตาราง `game_accounts` มีฟิลด์ `user_id`, `category_id`, `game_name`, `game_id`, `notes`, `image_path` และ `status`

อย่านำ Publishable key ไปใช้แทนมาตรการ RLS และอย่าเพิ่ม Service Role key ลงในตัวแปรที่ขึ้นต้นด้วย `NEXT_PUBLIC_`

### ติดตั้ง Automation Center (ตัวเลือกเสริม)

หากต้องการใช้หน้า Automation Center ให้รัน migration ต่อไปนี้ใน Supabase SQL Editor:

```
supabase/migrations/20261114000000_automation_center.sql
```

Migration นี้เพิ่มตารางสำหรับ settings, workflows, rules, tags, events และ scheduled reports พร้อมเปิด RLS และสร้าง owner policies โดยออกแบบเป็นการเพิ่มตาราง ไม่ได้ลบแถวบัญชีเกมเดิม

หากยังไม่ติดตั้ง migration นี้ หน้า Dashboard หลักยังเป็นส่วนแยกจาก Automation Center แต่หน้า Automation จะแสดงคำเตือนว่าต้องติดตั้งฐานข้อมูลก่อน

## คำสั่งที่ใช้บ่อย

```bash
npm run dev      # เปิด development server
npm run lint     # ตรวจสอบโค้ดด้วย ESLint
npm run build    # สร้าง production build
npm run start    # รัน production server หลัง build
```

## Environment Variables

| Variable | ใช้สำหรับ |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL ของ Supabase project |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key สำหรับ client/server SDK |

ไม่มีการกำหนดค่า secret key ใน README นี้ ให้จัดเก็บ secret เพิ่มเติมใน Environment Variables ของ Vercel หรือระบบจัดการ secrets ที่เชื่อถือได้เท่านั้น

## Deploy บน Vercel

1. Import GitHub repository เข้า Vercel
2. เพิ่ม Environment Variables ที่ระบุไว้ข้างต้นใน Environment ที่ต้องการใช้งาน
3. Deploy โปรเจกต์
4. ตั้งค่า Site URL และ Redirect URLs ของ Supabase Auth ให้ตรงกับโดเมนที่ใช้งานจริง
5. ตรวจสอบ RLS และ Storage policies ใน Supabase ก่อนเปิดให้ใช้งาน

## โครงสร้างส่วนสำคัญ

```text
src/
  app/
    actions/       # Server Actions สำหรับ Auth และการจัดการบัญชี
    automation/    # หน้า Automation Center
    login/         # หน้าเข้าสู่ระบบ
    page.tsx       # หน้าหลักและการโหลดข้อมูล Dashboard
    dashboard-minimal.tsx
  lib/
    supabase/      # Supabase browser/server clients
supabase/
  migrations/      # SQL migrations
```

## ความปลอดภัยและข้อมูล

- ทุก Server Action สำหรับจัดการบัญชีตรวจสอบผู้ใช้ที่เข้าสู่ระบบและผูกการแก้ไข/ลบกับ `user_id`
- อย่าเปิดเผย Service Role key ใน browser หรือ commit ลง repository
- ใช้ RLS เป็นชั้นควบคุมสิทธิ์ในฐานข้อมูล ไม่พึ่งการซ่อน UI เพียงอย่างเดียว
- สำรองฐานข้อมูลก่อนรัน migration หรือเปลี่ยน schema
- การลบบัญชีอาจมีผลกับข้อมูลที่อ้างอิงบัญชีนั้น ควรตรวจสอบ foreign key และ Storage cleanup policy ก่อนเปลี่ยนระบบ

## สถานะเอกสาร

เอกสารนี้อธิบายการตั้งค่าตามโครงสร้างและไฟล์ที่มีอยู่ใน repository ณ branch ที่จัดทำ README หากมีการเพิ่ม migration, environment variable หรือบริการภายนอก ให้ปรับปรุงเอกสารนี้ตามการทำงานจริง
