<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Frontend & UI Rules
- WAJIB menggunakan Shadcn UI secara konsisten di semua komponen antarmuka.
- WAJIB menerapkan prinsip dan aturan dari `.agents/skills/design-taste-frontend/SKILL.md` di SETIAP iterasi membangun/merombak frontend:
  - Selalu sertakan satu baris "Design Read" dan penetapan dial (VARIANCE, MOTION, DENSITY) sebelum implementasi UI.
  - Anti-slop: hindari template cliché (AI-purple glow, generic 3-card layout, fake screenshots, pure black #000000, unmotivated motion).
  - Pertahankan konsistensi tema (dark mode tokens via CSS variables / Tailwind v4), WCAG AA contrast, dan hierarki tipografi.
