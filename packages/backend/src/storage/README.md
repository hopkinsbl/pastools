# Storage Module

The Storage module provides file upload and download functionality using S3-compatible object storage (MinIO or AWS S3).

## Features

- **Presigned URL Upload**: Generate presigned URLs for direct client-to-S3 uploads
- **Server-side Upload**: Upload files directly from the backend
- **Presigned URL Download**: Generate time-limited download URLs
- **File Metadata**: Store and retrieve file metadata in PostgreSQL
- **File Size Validation**: Enforce 100MB file size limit
- **Authorization**: All endpoints protected by JWT authentication

## Configuration

The module requires the following environment variables:

```env
S3_ENDPOINT=http://localhost:9000        # MinIO/S3 endpoint URL
S3_ACCESS_KEY=pastools                   # S3 access key
S3_SECRET_KEY=pastools_dev_password      # S3 secret key
S3_BUCKET=pastools-files                 # S3 bucket name
```

## API Endpoints

### Request Upload URL

Generate a presigned URL for client-side file upload.

```
POST /storage/upload-url
Authorization: Bearer <jwt-token>

Request Body:
{
  "filename": "document.pdf",
  "contentType": "application/pdf",
  "size": 1048576
}

Response:
{
  "uploadUrl": "https://...",
  "fileId": "uuid",
  "storageKey": "uuid.pdf"
}
```

**Client Upload Flow:**
1. Request upload URL from backend
2. Use the presigned URL to PUT the file directly to S3
3. Use the returned `fileId` to reference the file

### Get File

Get file metadata and download URL.

```
GET /storage/files/:id
Authorization: Bearer <jwt-token>

Response:
{
  "downloadUrl": "https://...",
  "filename": "document.pdf",
  "contentType": "application/pdf",
  "size": 1048576
}
```

### Get File Metadata

Get file metadata without generating download URL.

```
GET /storage/files/:id/metadata
Authorization: Bearer <jwt-token>

Response:
{
  "id": "uuid",
  "filename": "document.pdf",
  "contentType": "application/pdf",
  "size": 1048576,
  "storageKey": "uuid.pdf",
  "uploadedAt": "2024-01-01T00:00:00Z",
  "uploadedBy": "user-uuid",
  "uploadedByUser": { ... }
}
```

### Delete File

Delete a file from storage and database.

```
DELETE /storage/files/:id
Authorization: Bearer <jwt-token>

Response: 204 No Content
```

### List My Files

List all files uploaded by the current user.

```
GET /storage/my-files
Authorization: Bearer <jwt-token>

Response:
[
  {
    "id": "uuid",
    "filename": "document.pdf",
    "contentType": "application/pdf",
    "size": 1048576,
    "uploadedAt": "2024-01-01T00:00:00Z"
  },
  ...
]
```

## Usage in Other Modules

To use the StorageService in other modules:

```typescript
import { StorageModule } from '../storage/storage.module';
import { StorageService } from '../storage/storage.service';

@Module({
  imports: [StorageModule],
  // ...
})
export class MyModule {
  constructor(private storageService: StorageService) {}

  async uploadFile(buffer: Buffer, filename: string, userId: string) {
    return await this.storageService.uploadFile(
      filename,
      'application/pdf',
      buffer,
      userId
    );
  }

  async getDownloadUrl(fileId: string) {
    return await this.storageService.generateDownloadUrl(fileId);
  }
}
```

## Security

- All endpoints require JWT authentication
- Presigned URLs are time-limited:
  - Upload URLs: 15 minutes
  - Download URLs: 1 hour
- File size limit: 100MB
- Files are stored with unique UUIDs to prevent collisions

## Testing

Run the storage service tests:

```bash
npm test -- storage.service.spec.ts
```

## Requirements Validation

This module implements:
- **Requirement 6.1**: File size limit of 100MB
- **Requirement 6.2**: S3-compatible object storage
- **Requirement 6.3**: File metadata storage (filename, size, content type, timestamp, uploader)
- **Requirement 6.4**: Presigned download URLs for authorized users
