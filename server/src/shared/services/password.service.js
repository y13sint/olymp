import bcrypt from 'bcryptjs'

const SALT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 12

export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS)
}

export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}
