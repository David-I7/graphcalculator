import crypto from "node:crypto";

export function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((res, rej) =>
    crypto.scrypt(password.normalize(), salt, 64, (err, hash) => {
      if (err) return rej(err);
      return res(salt + `$` + hash.toString("hex"));
    })
  );
}

export function isHashedPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return new Promise((res, rej) => {
    const parts = hashedPassword.split("$");
    if (parts.length !== 2) return res(false);

    const [salt, hash] = parts;

    crypto.scrypt(password.normalize(), salt, 64, (err, derivedKey) => {
      if (err) return rej(err);
      derivedKey.toString("hex") === hash ? res(true) : res(false);
    });
  });
}
