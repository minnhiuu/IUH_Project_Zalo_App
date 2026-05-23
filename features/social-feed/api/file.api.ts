import axiosInstance from '@/config/axiosInstance'
import type { ApiResponse } from '@/types/common.types'

interface FileUploadResponse {
  fileName: string
  key: string
}

export const fileApi = {
  upload: (uri: string, type: 'IMAGE' | 'VIDEO') => {
    const formData = new FormData();
    const fileName = uri.split('/').pop() || 'file';
    const name = fileName.split('.').slice(0, -1).join('.') || 'file';
    let ext = fileName.split('.').pop()?.toLowerCase() || (type === 'IMAGE' ? 'jpg' : 'mp4');

    if (ext === 'jpeg') ext = 'jpg';

    formData.append('file', {
      uri,
      name: `${name}.${ext}`,
      type: type === 'IMAGE' ? `image/${ext}` : `video/${ext}`
    } as any);

    return axiosInstance.post<ApiResponse<FileUploadResponse>>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};
