import type {
  RefreshedUrl,
  UploadListItem,
  UploadRequest,
  UploadResult,
} from '@shared/types/upload.ts';

// The seam your design hinges on: the renderer asks main to "upload this file",
// "list my uploads", and "refresh a stale URL" without knowing whether bytes go
// to our hosted backend or the user's own bucket. Both implementations satisfy
// this interface; main selects which one is active (see select-adapter.ts).
export interface UploadAdapter {
  perform(request: UploadRequest): Promise<UploadResult>;
  list(): Promise<UploadListItem[]>;
  // A fresh presigned URL for an upload (its cached one expired).
  refreshUrl(uploadId: string): Promise<RefreshedUrl>;
}
