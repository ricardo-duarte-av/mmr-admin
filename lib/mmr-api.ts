import { 
  MMRConfig, 
  MediaFile, 
  MediaListResponse, 
  UserMediaUsage, 
  ServerStats, 
  ServerHealth, 
  MediaSearchParams,
  CacheStats,
  QuarantineInfo,
  APIError 
} from '@/types/mmr';

class MMRApiClient {
  private config: MMRConfig;

  constructor(config: MMRConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error: APIError = await response.json().catch(() => ({
        error: 'Unknown Error',
        message: `HTTP ${response.status}: ${response.statusText}`,
        code: response.status,
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Media Management
  async getMediaList(params: MediaSearchParams = {}): Promise<MediaListResponse> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = `/api/v1/media${queryString ? `?${queryString}` : ''}`;
    
    return this.request<MediaListResponse>(endpoint);
  }

  async getMediaById(mediaId: string): Promise<MediaFile> {
    return this.request<MediaFile>(`/api/v1/media/${mediaId}`);
  }

  async deleteMedia(mediaId: string): Promise<void> {
    await this.request<void>(`/api/v1/media/${mediaId}`, {
      method: 'DELETE',
    });
  }

  async downloadMedia(mediaId: string): Promise<Blob> {
    const response = await fetch(`${this.config.baseUrl}/api/v1/media/${mediaId}/download`, {
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download media: ${response.statusText}`);
    }

    return response.blob();
  }

  async getMediaUrl(mediaId: string): string {
    return `${this.config.baseUrl}/api/v1/media/${mediaId}/download?access_token=${this.config.apiKey}`;
  }

  // User Management
  async getUserMediaUsage(userId: string): Promise<UserMediaUsage> {
    return this.request<UserMediaUsage>(`/api/v1/users/${userId}/media`);
  }

  async getAllUsersMediaUsage(): Promise<UserMediaUsage[]> {
    return this.request<UserMediaUsage[]>('/api/v1/users/media');
  }

  async deleteUserMedia(userId: string): Promise<void> {
    await this.request<void>(`/api/v1/users/${userId}/media`, {
      method: 'DELETE',
    });
  }

  // Server Management
  async getServerStats(): Promise<ServerStats> {
    return this.request<ServerStats>('/api/v1/server/stats');
  }

  async getServerHealth(): Promise<ServerHealth> {
    return this.request<ServerHealth>('/api/v1/server/health');
  }

  async getCacheStats(): Promise<CacheStats> {
    return this.request<CacheStats>('/api/v1/server/cache');
  }

  // Quarantine Management
  async quarantineMedia(mediaId: string, reason: string): Promise<void> {
    await this.request<void>(`/api/v1/media/${mediaId}/quarantine`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async unquarantineMedia(mediaId: string): Promise<void> {
    await this.request<void>(`/api/v1/media/${mediaId}/quarantine`, {
      method: 'DELETE',
    });
  }

  async getQuarantinedMedia(): Promise<QuarantineInfo[]> {
    return this.request<QuarantineInfo[]>('/api/v1/quarantine');
  }

  // Datastore Management
  async getDatastores(): Promise<any[]> {
    return this.request<any[]>('/api/v1/datastores');
  }

  async migrateMedia(fromDatastore: string, toDatastore: string, mediaId: string): Promise<void> {
    await this.request<void>(`/api/v1/datastores/migrate`, {
      method: 'POST',
      body: JSON.stringify({
        fromDatastore,
        toDatastore,
        mediaId,
      }),
    });
  }

  // Cache Management
  async clearCache(): Promise<void> {
    await this.request<void>('/api/v1/cache/clear', {
      method: 'POST',
    });
  }

  async warmCache(mediaId: string): Promise<void> {
    await this.request<void>(`/api/v1/cache/warm/${mediaId}`, {
      method: 'POST',
    });
  }
}

// Create a singleton instance
let apiClient: MMRApiClient | null = null;

export function initializeMMRApi(config: MMRConfig): MMRApiClient {
  apiClient = new MMRApiClient(config);
  return apiClient;
}

export function getMMRApi(): MMRApiClient {
  if (!apiClient) {
    throw new Error('MMR API not initialized. Call initializeMMRApi first.');
  }
  return apiClient;
}

export { MMRApiClient };
