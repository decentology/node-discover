import crypto from "crypto";

export class Security {
    public static encrypt(data: string, key: string) {
        const buffer = [];
        const cipher = crypto.createCipher("aes256", key);

        buffer.push(cipher.update(data, "utf8", "binary"));
        buffer.push(cipher.final("binary"));

        return buffer.join("");
    }

    public static decrypt(data: string, key: string) {
        const buffer = [];
        const decipher = crypto.createDecipher("aes256", key);

        buffer.push(decipher.update(data, "binary", "utf8"));
        buffer.push(decipher.final("utf8"));

        return buffer.join("");
    }
}
