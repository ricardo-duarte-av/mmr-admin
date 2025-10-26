// Matrix Media Repo API Types

export interface MMRConfig {
  baseUrl: string;
  apiKey: string;
}

export interface MediaFile {
  mediaId: string;
  uploadName: string;
  contentType: string;
  sizeBytes: number;
  uploadDate: string;
  userId: string;
  serverName: string;
  location: string;
  quarantined: boolean;
  datastoreId: string;
  datastoreIdStr: string;
}

export interface MediaListResponse {
  media: MediaFile[];
  total: number;
  offset: number;
  limit: number;
}

export interface UserMediaUsage {
  userId: string;
  displayName: string;
  mediaCount: number;
  totalSizeBytes: number;
  lastActive: string;
}

export interface ServerStats {
  totalMedia: number;
  totalSizeBytes: number;
  totalUsers: number;
  datastores: DatastoreInfo[];
  cacheSize: number;
  cacheHitRate: number;
}

export interface DatastoreInfo {
  id: string;
  type: string;
  enabled: boolean;
  sizeBytes: number;
  mediaCount: number;
}

export interface ServerHealth {
  healthy: boolean;
  uptime: number;
  version: string;
  datastores: {
    [key: string]: {
      healthy: boolean;
      lastCheck: string;
    };
  };
}

export interface MediaSearchParams {
  userId?: string;
  serverName?: string;
  contentType?: string;
  before?: string;
  after?: string;
  limit?: number;
  offset?: number;
  orderBy?: 'uploadDate' | 'sizeBytes' | 'contentType';
  orderDirection?: 'asc' | 'desc';
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  cacheSize: number;
  maxCacheSize: number;
}

export interface QuarantineInfo {
  mediaId: string;
  reason: string;
  quarantinedBy: string;
  quarantinedAt: string;
}

export interface APIError {
  error: string;
  message: string;
  code?: number;
}

export interface PaginationInfo {
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
}
