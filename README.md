# Remindarin

> The intelligent reminder system that understands **context**, not just time.

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA_NIM-1.8-green?style=for-the-badge)](https://build.nvidia.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-success?style=for-the-badge)](https://web.dev/progressive-web-apps/)

**Remindarin** is a next-generation AI-powered reminder and life operating system that understands your **context** — time, location, energy level, calendar, and habits — to deliver reminders at the perfect moment.

---

## 🚀 Overview

Most reminder apps are broken. They only know **when** something should happen.  
**Remindarin** knows **when you can actually do it**.

Built as a **Web App + Progressive Web App (PWA)**, Remindarin delivers a premium, calm, and intelligent experience that feels like having a personal life assistant.

---

## ✨ Key Features

### Core Intelligence
- **Context-Aware Reminders** — Understands time, location, energy, and calendar
- **Smart Capture** — Natural language + voice input
- **Proactive Suggestions** — Anticipates your needs
- **Energy & Mood Awareness** — Adapts to how you feel
- **Location Triggers** — Reminds you when you’re near relevant places

### User Experience
- Beautiful, calm interface following strict design system
- Fully responsive with excellent PWA experience
- Smart snooze and priority detection
- Weekly insights and habit analysis

### Technical Excellence
- Powered by **NVIDIA NIM** for fast, high-quality AI inference
- Real-time context engine
- Secure by design (NemoClaw integration planned)
- Modern tech stack with excellent developer experience

---

## 🛠 Tech Stack

| Layer              | Technology                          | Purpose |
|--------------------|-------------------------------------|--------|
| **Frontend**       | Next.js 15 + TypeScript + Tailwind  | Modern web app |
| **Styling**        | Tailwind CSS + Custom Design System | Strict visual language |
| **AI Engine**      | NVIDIA NIM (via API)                | Fast inference & reasoning |
| **State**          | Zustand + React Hook Form           | Lightweight & performant |
| **Database**       | Supabase (PostgreSQL + pgvector)    | Auth + Vector memory |
| **Deployment**     | Vercel                              | Edge functions + PWA |
| **PWA**            | next-pwa                            | Installable experience |

---

## 🏗 Project Structure

```bash
Frontend/
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vercel.json
├── vite.config.js
└── src/
    ├── App.jsx
    ├── App.css
    ├── main.jsx
    ├── index.css
    ├── components/
    │   ├── layout/
    │   │   ├── Footer.jsx
    │   │   └── Navbar.jsx
    │   └── ui/
    │       ├── Button.jsx
    │       ├── Input.jsx
    │       └── BottomSheet.jsx
    ├── context/
    │   └── AuthContext.jsx
    ├── pages/
    │   ├── LandingPage.jsx
    │   ├── 
    │   ├── 
    │   ├── 
    │   ├── 
    │   ├── 
    │   └── 
    │   
    └── services/
        └── authService.js