import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";

export class R2StorageService {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;

  constructor(env: {
    R2_ACCOUNT_ID: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    R2_BUCKET_NAME?: string;
  }) {
    if (!env.R2_ACCOUNT_ID || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
      throw new Error(
        "R2StorageService configuration error: R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, or R2_SECRET_ACCESS_KEY is missing.",
      );
    }
    this.bucketName = env.R2_BUCKET_NAME || "template-bucket";
    this.s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

  async generateUploadUrl({
    contentType,
    path,
  }: {
    contentType: string;
    path?: string;
  }): Promise<{ uploadUrl: string; key: string }> {
    const ext = contentType.split("/")[1] || "jpg";
    const filename = `${uuidv4()}.${ext}`;

    const cleanPath = path ? path.replace(/^\/+|\/+$/g, "") : "";
    const key = cleanPath ? `${cleanPath}/${filename}` : filename;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 900,
    });

    return { uploadUrl, key };
  }

  async generateViewUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: 600,
    });
  }

  async getObject(key: string): Promise<{
    arrayBuffer: () => Promise<ArrayBuffer>;
    size: number;
    httpMetadata?: { contentType?: string };
  } | null> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const response = await this.s3Client.send(command);
      if (!response.Body) return null;

      const bytes = await response.Body.transformToByteArray();
      return {
        arrayBuffer: async () => bytes.buffer as ArrayBuffer,
        size: response.ContentLength ?? bytes.byteLength,
        httpMetadata: {
          contentType: response.ContentType,
        },
      };
    } catch (err: any) {
      if (
        err.name === "NoSuchKey" ||
        err.name === "NotFound" ||
        err.$metadata?.httpStatusCode === 404
      ) {
        return null;
      }
      throw err;
    }
  }

  async putObject(
    key: string,
    body: ArrayBuffer | Uint8Array,
    contentType?: string,
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: body instanceof Uint8Array ? body : new Uint8Array(body),
      ContentType: contentType,
    });
    await this.s3Client.send(command);
  }

  async deleteObject(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      await this.s3Client.send(command);
    } catch (err) {
      console.warn("Failed to delete object from R2 via S3 SDK:", err);
    }
  }
}
