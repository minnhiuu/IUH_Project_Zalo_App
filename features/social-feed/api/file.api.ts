import axiosInstance from '@/config/axiosInstance'
import type { ApiResponse } from '@/types/common.types'
import * as FileSystem from 'expo-file-system/legacy'

interface FileUploadResponse {
  fileName: string
  key: string
}

interface PresignFileRequest {
  folder: string
  fileName: string
  contentType: string
  size: number
}

interface PresignedUploadResponse {
  key: string
  presignedUrl: string
  publicUrl: string
  contentType: string
  originalFileName: string
  size: number
  expiresAt: string
}

export interface PresignedUploadResult {
  key: string
  publicUrl: string
  type: 'IMAGE' | 'VIDEO'
}

const DEFAULT_FOLDER = 'misc'

const getFileNameFromUri = (uri: string, fallbackExt: string) => {
  const nameFromPath = uri.split('/').pop()?.split('?')[0] || `file.${fallbackExt}`
  if (!nameFromPath.includes('.')) {
    return `${nameFromPath}.${fallbackExt}`
  }
  return nameFromPath
}

const resolveContentType = (ext: string, type: 'IMAGE' | 'VIDEO') => {
  const normalizedExt = ext.toLowerCase()
  if (type === 'IMAGE') {
    return `image/${normalizedExt === 'jpg' ? 'jpeg' : normalizedExt}`
  }
  if (normalizedExt === 'mov') return 'video/quicktime'
  return `video/${normalizedExt || 'mp4'}`
}

const buildPresignRequest = async (uri: string, type: 'IMAGE' | 'VIDEO', folder: string) => {
  const fallbackExt = type === 'IMAGE' ? 'jpg' : 'mp4'
  const fileName = getFileNameFromUri(uri, fallbackExt)
  const ext = fileName.split('.').pop() || fallbackExt
  const contentType = resolveContentType(ext, type)

  const info = await FileSystem.getInfoAsync(uri)
  const size = (info as { size?: number }).size ?? 0
  if (!size) {
    throw new Error('Cannot determine file size for upload')
  }

  return {
    fileName,
    contentType,
    size,
    folder: folder || DEFAULT_FOLDER
  } satisfies PresignFileRequest
}

const uploadToPresignedUrl = async (presigned: PresignedUploadResponse, uri: string) => {
  const uploadResult = await FileSystem.uploadAsync(presigned.presignedUrl, uri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: {
      'Content-Type': presigned.contentType
    }
  })


  if (uploadResult.status < 200 || uploadResult.status >= 300) {
    throw new Error(`Upload failed with status ${uploadResult.status}`)
  }
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
  },

  uploadLikeWeb: async (uri: string, type: 'IMAGE' | 'VIDEO'): Promise<PresignedUploadResult> => {
    const response = await fileApi.upload(uri, type)
    const key = response.data?.data?.key


    if (!key) {
      throw new Error('Missing uploaded media key')
    }

    return {
      key,
      publicUrl: key,
      type
    }
  },

  presignBatch: (requests: PresignFileRequest[]) =>
    axiosInstance.post<ApiResponse<PresignedUploadResponse[]>>('/files/presign/batch', requests),

  uploadBatchWithPresigned: async (
    items: Array<{ uri: string; type: 'IMAGE' | 'VIDEO' }>,
    folder = DEFAULT_FOLDER
  ): Promise<PresignedUploadResult[]> => {
    if (items.length === 0) return []

    const presignRequests = await Promise.all(
      items.map((item) => buildPresignRequest(item.uri, item.type, folder))
    )

    const response = await fileApi.presignBatch(presignRequests)
    const presignedList = response.data?.data ?? []
    const presignedByName = new Map(
      presignedList.map((entry) => [entry.originalFileName, entry])
    )

    const resolvedPresigned = presignRequests.map((request, index) => {
      return presignedList[index] ?? presignedByName.get(request.fileName)
    })

    if (resolvedPresigned.some((entry) => !entry)) {
      throw new Error('Presigned upload data is incomplete')
    }

    await Promise.all(
      resolvedPresigned.map((entry, index) => uploadToPresignedUrl(entry as PresignedUploadResponse, items[index].uri))
    )

    return resolvedPresigned.map((entry, index) => ({
      key: (entry as PresignedUploadResponse).key,
      publicUrl: (entry as PresignedUploadResponse).publicUrl,
      type: items[index].type
    }))
  },

  uploadWithPresigned: async (uri: string, type: 'IMAGE' | 'VIDEO', _folder = DEFAULT_FOLDER) => {
    return fileApi.uploadLikeWeb(uri, type)
  }
};
