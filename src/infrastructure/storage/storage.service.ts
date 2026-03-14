import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    CreateBucketCommand,
    HeadBucketCommand,
    PutBucketPolicyCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";
import { extname } from "path";

@Injectable()
export class StorageService implements OnModuleInit {
    private readonly logger = new Logger(StorageService.name);
    private readonly s3: S3Client;
    private readonly bucket: string;

    constructor(private readonly config: ConfigService) {
        const endpoint = config.getOrThrow<string>("RUSTFS_ENDPOINT");
        this.bucket = config.getOrThrow<string>("RUSTFS_BUCKET");

        this.s3 = new S3Client({
            endpoint,
            region: config.get<string>("RUSTFS_REGION", "us-east-1"),
            credentials: {
                accessKeyId: config.getOrThrow<string>("RUSTFS_ACCESS_KEY"),
                secretAccessKey: config.getOrThrow<string>("RUSTFS_SECRET_KEY"),
            },
            // Required for path-style URLs (RustFS / MinIO-compatible)
            forcePathStyle: true,
        });
    }

    async onModuleInit(): Promise<void> {
        await this.ensureBucket();
    }

    /**
     * Creates the bucket if it does not exist, then sets a public-read policy.
     * Safe to call multiple times (idempotent).
     */
    private async ensureBucket(): Promise<void> {
        try {
            await this.s3.send(new HeadBucketCommand({ Bucket: this.bucket }));
            this.logger.log(`Bucket "${this.bucket}" already exists.`);
        } catch {
            // Bucket does not exist — create it
            await this.s3.send(new CreateBucketCommand({ Bucket: this.bucket }));
            this.logger.log(`Bucket "${this.bucket}" created.`);
        }

        // Apply public-read policy so uploaded URLs are directly accessible
        const policy = JSON.stringify({
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Principal: "*",
                    Action: "s3:GetObject",
                    Resource: `arn:aws:s3:::${this.bucket}/*`,
                },
            ],
        });

        await this.s3.send(
            new PutBucketPolicyCommand({ Bucket: this.bucket, Policy: policy }),
        );
        this.logger.log(`Public-read policy applied to "${this.bucket}".`);
    }

    /**
     * Upload a raw buffer.
     * @returns The absolute path stored in DB: `/${bucket}/${key}`
     *          e.g. "/kalynow-assets/offers/uuid.jpg"
     *          The front-end prefixes this with the storage host to get the full URL.
     */
    async upload(
        buffer: Buffer,
        originalName: string,
        folder: string,
    ): Promise<string> {
        const ext = extname(originalName).toLowerCase();
        const key = `${folder}/${randomUUID()}${ext}`;

        try {
            await this.s3.send(
                new PutObjectCommand({
                    Bucket: this.bucket,
                    Key: key,
                    Body: buffer,
                    ContentType: this.contentType(ext),
                }),
            );
        } catch (err) {
            throw new InternalServerErrorException(
                `Storage upload failed: ${(err as Error).message}`,
            );
        }

        return `/${this.bucket}/${key}`;
    }

    /**
     * Generate a short-lived pre-signed GET URL for private objects.
     */
    async presignedUrl(key: string, expiresIn = 3600): Promise<string> {
        return getSignedUrl(
            this.s3,
            new GetObjectCommand({ Bucket: this.bucket, Key: key }),
            { expiresIn },
        );
    }

    /**
     * Delete an object by its storage key (e.g. "offers/uuid.jpg").
     */
    async delete(key: string): Promise<void> {
        await this.s3.send(
            new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
        );
    }

    private contentType(ext: string): string {
        const map: Record<string, string> = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".webp": "image/webp",
            ".gif": "image/gif",
            ".svg": "image/svg+xml",
        };
        return map[ext] ?? "application/octet-stream";
    }
}
