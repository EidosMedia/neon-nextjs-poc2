# Next.js Headless App with Eidosmedia Neon – Proof of Concept

> ⚠️ **Warning**  
> This is **not** a production-ready application.  
> It is a **Proof of Concept** designed to showcase how to interact with **Eidosmedia Neon** APIs.  
> Many implementations are done quickly and intentionally bypass best practices. Do **not** use this code as-is in production environments.

---

## About the Project

This project demonstrates how to use [Next.js](https://nextjs.org) in a headless configuration to connect with **Eidosmedia Neon**. It highlights:

- How Neon APIs can be used to power a modern frontend
- Realistic interaction patterns between a web client and the Neon CMS
- Key integration use cases in a developer-friendly context

The purpose is to **illustrate usage**, not to provide a template or pattern for building production apps.

---

## PoC Showcases

The project showcases a lot of real use cases, such as:

- Integration of the Front Office Library for interaction with Neon
- Compatibility with Neon's SaaS Sites provisioning
- Showcase of Neon's URL management for content
- Showcase of Neon's Sitemaps and Menus handling
- Handling of Neon's advanced versioning features and rollback
- Secured Content Preview and Authorization through Neon's Webapp
- Content modification through the Preview
- Open Neon Webapp's editor for an object from the Site rendering

---

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

You can begin editing by modifying `app/page.tsx`. The page auto-updates as you make changes.

---

## Setup Instructions

1. Clone the repository
2. Create an `.env` file (you can copy and rename `.env.example`)
3. Make sure your Neon credentials and endpoints are correctly set

---

## Development Notes

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a font family by Vercel.

We recommend having the following VS Code plugin installed:

- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

---

## Debugging in VS Code

If breakpoints don’t trigger or you encounter issues debugging:

1. Stop the running server
2. In Chrome, go to `chrome://inspect`
3. Click **"Configure..."** and add `localhost:9230`
4. Restart the dev server with `npm run dev`
5. Reopen `chrome://inspect` and navigate to the page you want to debug

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) — explore features and API
- [Learn Next.js](https://nextjs.org/learn) — an interactive tutorial
- [Next.js GitHub](https://github.com/vercel/next.js) — for source code and contributions

---

## Disclaimer

This repository is for **educational and experimental** use only.  
Use it as a reference to understand Neon API integration patterns, not as a base for production-grade applications.
 
