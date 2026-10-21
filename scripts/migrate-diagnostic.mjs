import 'dotenv/config'
import { resolve } from 'node:path'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import pg from 'pg'

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL is not set. Set it in the shell before running this command.')
  process.exit(1)
}

const pool = new pg.Pool({ connectionString })

try {
  await migrate(drizzle(pool), {
    migrationsFolder: resolve('server/database/migrations'),
  })
  console.log('Database migrations applied successfully.')
} catch (error) {
  console.error('Database migration failed. Detailed driver error:')
  console.dir(error, { depth: 6 })
  if (error?.cause) {
    console.error('Underlying PostgreSQL error:')
    console.dir(error.cause, { depth: 6 })
  }
  process.exitCode = 1
} finally {
  await pool.end()
}
