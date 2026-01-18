import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Configuración
const JWT_SECRET = process.env.JWT_SECRET || 'tu-secret-key-super-seguro-cambiar-en-produccion';
const JWT_EXPIRES_IN = '30d'; // Token válido por 30 días
const BCRYPT_ROUNDS = 10;

export interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}

/**
 * Hashea una contraseña usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compara una contraseña con su hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Genera un token JWT
 */
export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verifica y decodifica un token JWT
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

/**
 * Valida formato de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Valida formato de username (debe comenzar con @ y tener 3-20 caracteres)
 */
export function isValidUsername(username: string): boolean {
  const usernameRegex = /^@[A-Za-z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

/**
 * Valida contraseña (mínimo 6 caracteres)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Normaliza username (agrega @ si no lo tiene)
 */
export function normalizeUsername(username: string): string {
  if (username.startsWith('@')) {
    return username;
  }
  return '@' + username;
}
