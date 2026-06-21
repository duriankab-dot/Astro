# ASTROVERA — พร้อมอัปขึ้น GitHub

โฟลเดอร์นี้จัดเรียงไฟล์ไว้ตามที่ **GitHub Pages** ต้องการแล้ว (ทุกไฟล์อยู่ root เดียวกัน, `index.html` คือไฟล์หลัก)

## วิธีอัปขึ้น GitHub Pages (ไม่ต้องใช้ command line ก็ได้)

1. สร้าง repository ใหม่บน GitHub (Public)
2. หน้า repo → **Add file → Upload files** → ลากไฟล์ทั้งหมดในโฟลเดอร์นี้ใส่ (รวม `index.html` ด้วย) → Commit
3. ไปที่ **Settings → Pages** → เลือก Branch = `main`, Folder = `/ (root)` → Save
4. รอ 1-2 นาที จะได้ลิงก์ประมาณ `https://ชื่อยูส.github.io/ชื่อ-repo/`

## ⚠️ สิ่งที่ต้องแก้หลังได้ลิงก์จริง

เปิดไฟล์ 2 ไฟล์นี้ แทนที่ `YOUR-DOMAIN-HERE` ด้วยลิงก์จริงที่ได้จากข้อ 4:
- `robots.txt`
- `sitemap.xml`

(ไม่แก้ก็ใช้แอปได้ปกติ แค่ SEO/sitemap จะยังชี้ไปโดเมนปลอม)

## 🪐 เปิดใช้ฟีเจอร์ "ดวงดาวจริง" (Western Astrology)

ฟีเจอร์นี้ต้องมี API key จาก astrology API จริง (เช่น FreeAstrologyAPI.com) — ไม่มี key ฟีเจอร์นี้จะ error แต่ ไม่กระทบส่วนอื่นของแอปเลย

ตั้งค่าที่: GitHub repo ของคุณ → ไป **Netlify dashboard** → เลือก site → **Site configuration → Environment variables** → Add a variable:
- Key: `ASTROLOGY_API_KEY`
- Value: (key จริงที่ได้จากการสมัคร provider)

จากนั้น **Trigger deploy** ใหม่ 1 ครั้งให้ Netlify อ่านค่าตัวแปรใหม่ — เสร็จแล้วฟีเจอร์ "คำนวณดวงจริง" ในหน้า Self Intelligence จะใช้งานได้

ถ้าสมัคร provider เจ้าอื่นที่ไม่ใช่ FreeAstrologyAPI.com ต้องแก้โค้ดส่วน "PROVIDER-SPECIFIC" ใน `netlify/functions/natal-chart.js` ให้ตรงกับ endpoint/รูปแบบ request ของเจ้านั้นด้วย

## หมายเหตุสำคัญ

- ถ้า repo เป็นแบบ Project Pages (`username.github.io/repo-name/`) ไม่ใช่ root domain — ไฟล์นี้ใช้ relative path (`./`) ทุกจุดอยู่แล้ว ใช้งานได้ปกติไม่ต้องแก้โค้ด
- Service Worker (`sw.js`) จะทำงานก็ต่อเมื่อเข้าผ่าน `https://` เท่านั้น (GitHub Pages เป็น https อยู่แล้ว ไม่มีปัญหา)
- ข้อมูลผู้ใช้ (localStorage) ผูกกับโดเมนนี้โดยเฉพาะ — ถ้าย้ายโดเมนทีหลัง ข้อมูลเก่าจะไม่ตามมา
