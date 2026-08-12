import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = 12;

export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function comparePassword(plainPassword, hash) {
  return bcrypt.compare(plainPassword, hash);
}

export function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" }
  );
}

export function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );
}