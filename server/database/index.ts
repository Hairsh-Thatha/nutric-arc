import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

let pool: Pool | undefined

export function database() {
  const config = useRuntimeConfig()
  // Check runtime environment variables as well as Nuxt runtimeConfig so
  // Vercel variables work even when they were unavailable during build.
  const connectionString = process.env.NUXT_DATABASE_URL
    || process.env.DATABASE_URL
    || config.databaseUrl

  if (!connectionString) {
    throw createError({ statusCode: 503, statusMessage: 'Database URL is not configured' })
  }

  pool ??= new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined,
  })

  return drizzle(pool, { schema })
}
