import crypto from "crypto";

function getKey(): Buffer {
  const hex = process.env.ENCRYPTION_KEY ?? "";
  const isHex64 = hex.length === 64 && /^[0-9a-fA-F]{64}$/.test(hex);

  if (process.env.NODE_ENV === "production") {
    if (!isHex64) {
      throw new Error(
        "CRITICAL: ENCRYPTION_KEY is missing or invalid in production. Must be exactly 64 hexadecimal characters."
      );
    }
  } else {
    if (!isHex64) {
      // In development fallback only
      return Buffer.alloc(32, 0);
    }
  }

  return Buffer.from(hex, "hex");
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  // Format: iv(12):tag(16):ciphertext
  return [
    iv.toString("hex"),
    tag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decrypt(ciphertext: string): string {
  const key = getKey();
  const [ivHex, tagHex, dataHex] = ciphertext.split(":");
  if (!ivHex || !tagHex || !dataHex) return "";
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data) + decipher.final("utf8");
}
