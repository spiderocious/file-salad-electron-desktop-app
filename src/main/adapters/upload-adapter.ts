import type { UploadListItem, UploadRequest, UploadResult } from '@shared/types/upload.ts';

// The seam your design hinges on: the renderer asks main to "upload this file"
// and "list my uploads" without knowing whether bytes go to our hosted backend
// or the user's own bucket. Both implementations satisfy this interface; main
// selects which one is active (see select-adapter.ts).
export interface UploadAdapter {
  perform(request: UploadRequest): Promise<UploadResult>;
  list(): Promise<UploadListItem[]>;
}
