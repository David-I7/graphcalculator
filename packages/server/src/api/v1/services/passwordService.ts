import crypto from "node:crypto";

export interface IPasswordService {
  hash(password: string): Promise<Buffer<ArrayBufferLike>>;
  compare(
    password: string,
    hashedPassword: Buffer<ArrayBufferLike>
  ): Promise<Boolean>;
}

export class PasswordService implements IPasswordService {
  async compare(
    password: string,
    hashedPassword: Buffer<ArrayBufferLike>
  ): Promise<Boolean> {
    return new Promise((res, rej) => {
      const salt = hashedPassword.subarray(0, 16);
      const hash = hashedPassword.subarray(16);

      crypto.scrypt(password.normalize(), salt, 64, (err, derivedKey) => {
        if (err) return rej(err);
        Buffer.compare(hash, derivedKey) === 0 ? res(true) : res(false);
      });
    });
  }

  hash(password: string): Promise<Buffer<ArrayBufferLike>> {
    const salt = crypto.randomBytes(16);
    return new Promise((res, rej) =>
      crypto.scrypt(password.normalize(), salt, 64, (err, hash) => {
        if (err) return rej(err);
        return res(Buffer.concat([salt, hash]));
      })
    );
  }
}
