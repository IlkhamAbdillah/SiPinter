import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/*
 * Password hashing with Node's built-in scrypt (memory-hard, no native dependency).
 * Parameters follow the OWASP Password Storage Cheat Sheet (N=2^15, r=8, p=3 ≈ 32 MiB).
 * They are stored inside each hash, so they can be raised later without breaking old hashes.
 */
const PARAMS = { N: 2 ** 15, r: 8, p: 3 } as const;
const KEY_LENGTH = 32;
const SALT_LENGTH = 16;
const MAX_MEMORY = 64 * 1024 * 1024;

function derive(password: string, salt: Buffer, params: { N: number; r: number; p: number }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, { ...params, maxmem: MAX_MEMORY }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

/** Returns `scrypt$N$r$p$<salt base64>$<hash base64>`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await derive(password, salt, PARAMS);
  return ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;
  const [N, r, p] = parts.slice(1, 4).map(Number);
  if (!N || !r || !p) return false;

  const expected = Buffer.from(parts[5]!, "base64");
  if (expected.length !== KEY_LENGTH) return false;
  const actual = await derive(password, Buffer.from(parts[4]!, "base64"), { N, r, p });
  return timingSafeEqual(actual, expected);
}

let dummyHash: Promise<string> | undefined;

/**
 * Burns the same CPU time as a real check. Used when the email does not exist,
 * so response timing does not reveal which emails have accounts.
 */
export async function verifyAgainstDummy(password: string): Promise<false> {
  dummyHash ??= hashPassword("sipinter-dummy-password");
  await verifyPassword(password, await dummyHash);
  return false;
}
