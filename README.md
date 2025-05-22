# Next.js headless app with Neon example

## The idea behind the example

The project uses [Next.js](https://nextjs.org), and shows how it is possible to integrate it with Eidosmedia NEON headless APIs.

WARNING: this code is not meant to be used in production! Many implementations are done "quick & dirty": the goal is NOT to provide Next.js or React development best practices - the goal is only to illustrate how to interact with Neon APIs.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Setup

After download of the project it will be necessary to create the .env file (or copy the .env.example and rename it).

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

Check if the following plugins are installed in Visual Studio Code:

- Prettier (https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Debugging

Sometime debugging with nextjs and vscode can be difficult, if you encounter come problems (eg: breakpoints does not trigger, debugging binary code ...) follow those steps:

- Stop the POC
- Open Chrome I pointed my browser to chrome://inspect and opened the inspector
- Click on "Configure..." button and add this url: localhost:9230
- Restart the server using npm run dev
- Open again the inspector in Chrome chrome://inspect
- Open the page that you want to debug
