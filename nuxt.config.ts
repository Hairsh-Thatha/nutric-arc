export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: { compatibilityVersion: 4 },
  css: ['~/assets/css/main.css'],
  modules: ['@nuxt/ui'],
  runtimeConfig: {
    // NUXT_DATABASE_URL is the Nuxt/Vercel runtime override; DATABASE_URL
    // remains supported for local development and existing deployments.
    databaseUrl: process.env.NUXT_DATABASE_URL || process.env.DATABASE_URL || '',
    aiApiKey: process.env.NUXT_AI_API_KEY || process.env.AI_API_KEY || '',
    aiModel: process.env.NUXT_AI_MODEL || process.env.AI_MODEL || 'gpt-4o-mini',
    public: { appName: 'NutriArc' },
  },
  typescript: { strict: true },
})
