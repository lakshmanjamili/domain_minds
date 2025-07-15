# Loukri Domain Minds

A premium, production-ready full-stack web app to generate creative, brandable domain names for your project or idea—powered by LLMs, with a ChatGPT-style experience, and ready for Vercel deployment.

---

## ✨ Features
- **Conversational chat UI**: Describe your project, get 10 domain ideas with explanations
- **Multiple conversations**: Create, name, switch, and delete chat sessions—each with its own history
- **LLM integration**: OpenRouter (easily swappable to GPT-4/OpenAI)
- **Domain availability check**: Instantly see if a domain is available
- **Buy button**: Instantly purchase available domains via GoDaddy
- **Persistent chat**: All conversations and suggestions are saved in your browser
- **Modern, beautiful UI**: Built with shadcn/ui and Tailwind CSS
- **Extensible**: Easily swap domain check logic, add more vendors, or connect to Supabase for cloud storage

---

## 🛠️ Tech Stack
- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (UI components)
- [OpenRouter](https://openrouter.ai/) (LLM API)
- [Supabase](https://supabase.com/) (optional, DB)
- [Clerk](https://clerk.com/) (optional, auth)
- [Datafast](https://datafast.com/) (optional, analytics)

---

## 🚀 Quick Start (Local Development)

1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   cd domain_minds
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   - Copy `.env.sample` to `.env` and fill in your keys (see below for how to get them)
   ```bash
   cp .env.sample .env
   ```
4. **Run the dev server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables & How to Get Keys

Copy `.env.sample` to `.env` and fill in:

```
OPENROUTER_API_KEY=your-openrouter-api-key
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-anon-key
CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key
DATAFAST_API_KEY=your-datafast-api-key
```

- **OpenRouter:** [Get a free API key](https://openrouter.ai/)
- **Supabase:** [Create a project and get keys](https://app.supabase.com/)
- **Clerk:** [Create a Clerk app and get keys](https://dashboard.clerk.com/)
- **Datafast:** [Sign up for analytics](https://datafast.com/)

> _You can leave optional keys blank if not using those features._

---

## 🏗️ Deployment (Vercel)

1. Push your code to GitHub/GitLab.
2. [Import your repo to Vercel](https://vercel.com/new).
3. Set environment variables in Vercel dashboard (same as `.env`).
4. Deploy!

---

## ⚙️ Configuration
- **Number of suggestions**: Change `NUM_SUGGESTIONS` in `src/lib/config.ts`.
- **Domain vendor**: Change `DOMAIN_VENDOR_URL` in `src/lib/config.ts` to use another registrar (e.g., Namecheap).
- **LLM model**: Change the model and endpoint in `src/lib/openrouter.ts`.

---

## 🧩 Extending (Auth, Analytics, DB)
- **Clerk:** Uncomment and configure `src/components/AuthProvider.tsx`.
- **Supabase:** Add logic in `src/lib/supabase.ts` and use for chat/session storage.
- **Datafast:** Add analytics hooks in `src/lib/datafast.ts`.

---

## 📁 Folder Structure
```
domain_minds/
  src/
    app/
      page.tsx             # Main UI (sidebar + chat)
      api/
        suggest-domains/   # LLM proxy route
        check-domain/      # Domain check route
    components/            # UI components (shadcn/ui, chat, etc.)
    lib/                   # API/utility modules, config
    types/                 # TypeScript types
  public/                  # Static assets (ai-avatar.png, etc.)
  .env.sample              # Env var template
  README.md
```

---

## 📝 License
MIT

---

## 🙋‍♂️ Contact & Support
- For issues, open a GitHub issue or contact the maintainer.
- Contributions welcome!
