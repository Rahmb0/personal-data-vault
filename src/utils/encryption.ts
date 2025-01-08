import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export class Encryption {
    private static readonly algorithm = 'aes-256-gcm';

    static async encrypt(data: any, key: string): Promise<{
        encryptedData: string;
        iv: string;
        tag: string;
    }> {
        const iv = randomBytes(16);
        const cipher = createCipheriv(this.algorithm, Buffer.from(key, 'hex'), iv);
        
        let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return {
            encryptedData: encrypted,
            iv: iv.toString('hex'),
            tag: cipher.getAuthTag().toString('hex')
        };
    }

    static async decrypt(
        encryptedData: string,
        key: string,
        iv: string,
        tag: string
    ): Promise<any> {
        const decipher = createDecipheriv(
            this.algorithm,
            Buffer.from(key, 'hex'),
            Buffer.from(iv, 'hex')
        );
        
        decipher.setAuthTag(Buffer.from(tag, 'hex'));
        
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return JSON.parse(decrypted);
    }
} 