# Prodigy Prophet - AI Art Critic

Prodigy Prophet is an AI-powered art critic that analyzes artwork uploaded by users and provides detailed feedback and critique. It uses Cloudflare Pages Functions to securely proxy requests to the OpenRouter API.

## Features
- Upload your artwork for AI analysis
- Receive professional critique on composition, technique, and creativity
- Chat with the AI to get deeper insights about your art
- Simple and elegant user interface with Dark/Light mode
- Secure API key handling via Cloudflare Pages Functions

## Local Development Setup
1. Clone this repository.
2. Run `npm install` to install dependencies.
3. For local development, the API calls will be proxied. If you want to test the proxy logic locally (e.g., using `wrangler`), you would need to set up a local `.dev.vars` file in the `functions` directory with your `OPENROUTER_KEY`. However, for simple UI development, the mock responses or a direct API call (temporarily, for local testing only, if you re-enable direct calls) can be used.
4. Run `npm run dev` to start the Vite development server.

## Deployment to Cloudflare Pages

This project is configured for deployment to Cloudflare Pages with serverless functions for API proxying.

1.  **Push to GitHub:** Commit and push your changes to a GitHub repository.
2.  **Connect to Cloudflare Pages:**
    *   Log in to your Cloudflare dashboard.
    *   Navigate to **Workers & Pages** and create a new **Pages** project.
    *   Connect it to your GitHub repository.
3.  **Build Configuration:**
    *   **Framework preset:** Select `Vite`.
    *   **Build command:** `npm run build` (or `vite build`)
    *   **Build output directory:** `dist`
4.  **Environment Variables (for Functions):**
    *   In your Cloudflare Pages project settings, go to **Settings** -> **Environment variables**.
    *   Under **Production** (and **Preview**, if desired), add a **Variable name** `OPENROUTER_KEY`.
    *   Set its **Value** to your actual OpenRouter API key.
    *   Ensure to **Encrypt** the key if the option is available and you deem it necessary (Cloudflare usually handles secrets securely).
5.  **Deploy:** Save your settings and trigger a deployment. Cloudflare will build your Vite app and deploy your serverless function from the `/functions` directory.

Your site will be available at `https://<your-project-name>.pages.dev`, and the API proxy will be at `https://<your-project-name>.pages.dev/openrouter-proxy`.

## Technologies
- React with Vite
- Cloudflare Pages Functions (for API proxy)
- OpenRouter AI API

---

# React + Vite (Original Readme Content)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
