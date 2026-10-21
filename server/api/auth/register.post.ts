import { z } from 'zod'
import { database } from '../../database'
import { users } from '../../database/schema'
import { hashPassword } from '../../utils/auth'
import { readValidated } from '../../utils/validation'

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254).transform(value => value.toLowerCase()),
  password: z.string().min(8).max(128),
})

export default defineEventHandler(async (event) => {
  const input = await readValidated(event, schema)

  try {
    const db = database()
    return await db.transaction(async (tx) => {
      const [created] = await tx
        .insert(users)
        .values({ name: input.name, email: input.email, passwordHash: hashPassword(input.password) })
        .onConflictDoNothing({ target: users.email })
        .returning({ id: users.id, name: users.name, email: users.email })

      if (!created) {
        throw createError({ statusCode: 409, statusMessage: 'An account with this email already exists.' })
      }

      return created
    })
  } catch (error) {
    const statusCode = (error as { statusCode?: number })?.statusCode
    if (statusCode && (statusCode < 500 || statusCode === 503)) throw error

    const cause = (error as { cause?: { code?: string; message?: string } })?.cause
    const databaseError = error as { code?: string; message?: string }
    // Never log the request body, password, connection string, or query parameters.
    console.error('[auth/register] Registration failed', {
      code: cause?.code ?? databaseError.code,
      message: cause?.message ?? databaseError.message,
    })
    throw createError({ statusCode: 500, statusMessage: 'Could not create your account. Please try again.' })
  }
})
