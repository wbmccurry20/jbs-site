/// <reference types="astro/client" />

interface ImportMetaEnv {
  /**
   * Base URL of the jbs-internal-portal backend API.
   * Set in your .env file for local development and in Vercel project settings for production.
   * When unset the payment application form runs in prototype / demo mode (submission disabled).
   *
   * Example: http://localhost:8080
   * Production: https://api.buildwithjbs.com  (update vercel.json connect-src to match)
   */
  readonly PUBLIC_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
