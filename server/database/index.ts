import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

let pool: Pool | undefined

export function database() {
  const config = useRuntimeConfig()
  // Prefer runtime deployment variables; config.databaseUrl remains a Nuxt runtime override.
  const connectionString = process.env.NUXT_DATABASE_URL?.trim()
    || process.env.DATABASE_URL?.trim()
    || config.databaseUrl?.trim()

  if (!connectionString) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Database URL is not configured. Set NUXT_DATABASE_URL in the deployment environment.',
    })
  }

  if (process.env.NODE_ENV === 'production') {
    const hostname = new URL(connectionString).hostname.toLowerCase()
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1' || hostname === '[::1]') {
      throw createError({
        statusCode: 503,
        statusMessage: 'The production database URL points to localhost. Set NUXT_DATABASE_URL to the hosted PostgreSQL connection string.',
      })
    }
  }

  pool ??= new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : undefined,
  })

  return drizzle(pool, { schema })
}
