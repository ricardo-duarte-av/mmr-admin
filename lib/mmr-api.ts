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
import { getMMRConfig, getMatrixConfig } from '@/lib/config';

class MMRApiClient {
  private config: MMRConfig;

  constructor(config: MMRConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}access_token=${this.config.apiKey}`;
    
    const defaultHeaders = {
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
  async getMediaList(params: MediaSearchParams = {}): Promise<any> {
    // Use the uploads endpoint to get media information
    const serverName = this.config.baseUrl.split('://')[1].split('/')[0];
    const endpoint = `/_matrix/media/unstable/admin/usage/${serverName}/uploads`;
    
    return this.request<any>(endpoint);
  }

  async getMediaById(mediaId: string): Promise<MediaFile> {
    // Note: MMR doesn't have a direct media by ID endpoint
    // This would need to be implemented differently
    throw new Error('getMediaById not implemented - MMR doesn\'t have this endpoint');
  }

  async deleteMedia(mediaId: string): Promise<void> {
    // Extract server and media ID from MXC URI or use direct format
    const endpoint = `/_matrix/media/unstable/admin/purge/media/${mediaId}`;
    await this.request<void>(endpoint, {
      method: 'POST',
    });
  }

  async downloadMedia(mediaId: string): Promise<Blob> {
    // MMR doesn't have a direct download endpoint for admin
    // Media is typically accessed via the normal media endpoint
    const response = await fetch(`${this.config.baseUrl}/_matrix/media/r0/download/${mediaId}?access_token=${this.config.apiKey}`);

    if (!response.ok) {
      throw new Error(`Failed to download media: ${response.statusText}`);
    }

    return response.blob();
  }

  async getMediaUrl(mediaId: string): string {
    return `${this.config.baseUrl}/_matrix/media/r0/download/${mediaId}?access_token=${this.config.apiKey}`;
  }

  // User Management
  async getUserMediaUsage(userId: string): Promise<UserMediaUsage> {
    const serverName = this.config.baseUrl.split('://')[1].split('/')[0];
    return this.request<UserMediaUsage>(`/_matrix/media/unstable/admin/usage/${serverName}/users?user_id=${encodeURIComponent(userId)}`);
  }

  async getAllUsersMediaUsage(): Promise<UserMediaUsage[]> {
    const serverName = this.config.baseUrl.split('://')[1].split('/')[0];
    return this.request<UserMediaUsage[]>(`/_matrix/media/unstable/admin/usage/${serverName}/users`);
  }

  async deleteUserMedia(userId: string): Promise<void> {
    await this.request<void>(`/_matrix/media/unstable/admin/purge/user/${encodeURIComponent(userId)}`, {
      method: 'POST',
    });
  }

  // Server Management
  async getServerStats(): Promise<ServerStats> {
    const serverName = this.config.baseUrl.split('://')[1].split('/')[0];
    return this.request<ServerStats>(`/_matrix/media/unstable/admin/usage/${serverName}`);
  }

  async getServerHealth(): Promise<ServerHealth> {
    // MMR doesn't have a health endpoint, so we'll use datastores as a connectivity test
    try {
      const datastores = await this.getDatastores();
      return {
        healthy: true,
        uptime: 0, // MMR doesn't provide uptime
        version: 'unknown', // MMR doesn't provide version
        datastores: datastores.reduce((acc, ds, index) => {
          acc[index.toString()] = {
            healthy: true,
            lastCheck: new Date().toISOString()
          };
          return acc;
        }, {} as { [key: string]: { healthy: boolean; lastCheck: string } })
      };
    } catch (error) {
      return {
        healthy: false,
        uptime: 0,
        version: 'unknown',
        datastores: {}
      };
    }
  }

  async getCacheStats(): Promise<CacheStats> {
    // MMR doesn't have a cache stats endpoint
    return {
      hitRate: 0,
      missRate: 0,
      totalRequests: 0,
      cacheSize: 0,
      maxCacheSize: 0
    };
  }

  // Quarantine Management
  async quarantineMedia(mediaId: string, reason: string): Promise<void> {
    await this.request<void>(`/_matrix/media/unstable/admin/quarantine/media/${mediaId}`, {
      method: 'POST',
    });
  }

  async unquarantineMedia(mediaId: string): Promise<void> {
    // MMR doesn't have an unquarantine endpoint
    throw new Error('Unquarantine not supported in MMR');
  }

  async getQuarantinedMedia(): Promise<QuarantineInfo[]> {
    // MMR doesn't have a list quarantined media endpoint
    return [];
  }

  // Datastore Management
  async getDatastores(): Promise<any[]> {
    return this.request<any[]>('/_matrix/media/unstable/admin/datastores');
  }

  async getDatastoreSizeEstimate(datastoreId: string): Promise<any> {
    return this.request<any>(`/_matrix/media/unstable/admin/datastores/${datastoreId}/size_estimate`);
  }

  async migrateMedia(fromDatastore: string, toDatastore: string, mediaId: string): Promise<void> {
    await this.request<void>(`/_matrix/media/unstable/admin/datastores/${fromDatastore}/transfer_to/${toDatastore}`, {
      method: 'POST',
    });
  }

  // Cache Management
  async clearCache(): Promise<void> {
    // MMR doesn't have a cache clear endpoint
    throw new Error('Cache clear not supported in MMR');
  }

  async warmCache(mediaId: string): Promise<void> {
    // MMR doesn't have a cache warm endpoint
    throw new Error('Cache warm not supported in MMR');
  }

  // Media Purge Management
  async purgeRemoteMedia(beforeTimestamp: number): Promise<void> {
    await this.request<void>(`/_matrix/media/unstable/admin/purge/remote?before_ts=${beforeTimestamp}`, {
      method: 'POST',
    });
  }

  async purgeQuarantinedMedia(): Promise<void> {
    await this.request<void>('/_matrix/media/unstable/admin/purge/quarantined', {
      method: 'POST',
    });
  }

  async purgeUserMedia(userId: string, beforeTimestamp: number): Promise<void> {
    await this.request<void>(`/_matrix/media/unstable/admin/purge/user/${encodeURIComponent(userId)}?before_ts=${beforeTimestamp}`, {
      method: 'POST',
    });
  }

  async purgeRoomMedia(roomId: string, beforeTimestamp: number): Promise<void> {
    await this.request<void>(`/_matrix/media/unstable/admin/purge/room/${encodeURIComponent(roomId)}?before_ts=${beforeTimestamp}`, {
      method: 'POST',
    });
  }

  async purgeServerMedia(serverName: string, beforeTimestamp: number): Promise<void> {
    await this.request<void>(`/_matrix/media/unstable/admin/purge/server/${encodeURIComponent(serverName)}?before_ts=${beforeTimestamp}`, {
      method: 'POST',
    });
  }

  async purgeOldMedia(beforeTimestamp: number, includeLocal: boolean = false): Promise<void> {
    await this.request<void>(`/_matrix/media/unstable/admin/purge/old?before_ts=${beforeTimestamp}&include_local=${includeLocal}`, {
      method: 'POST',
    });
  }

  async purgeIndividualMedia(server: string, mediaId: string): Promise<void> {
    await this.request<void>(`/_matrix/media/unstable/admin/purge/media/${encodeURIComponent(server)}/${encodeURIComponent(mediaId)}`, {
      method: 'POST',
    });
  }
}

// Create a singleton instance
let apiClient: MMRApiClient | null = null;

export function initializeMMRApi(config?: MMRConfig): MMRApiClient {
  const finalConfig = config || getMMRConfig();
  apiClient = new MMRApiClient(finalConfig);
  return apiClient;
}

export function getMMRApi(): MMRApiClient {
  if (!apiClient) {
    // Try to initialize with config file
    try {
      return initializeMMRApi();
    } catch (error) {
      throw new Error('MMR API not initialized and no config file found. Call initializeMMRApi first.');
    }
  }
  return apiClient;
}

// Validate Matrix access token using whoami endpoint
export async function validateMatrixToken(homeserverUrl: string, accessToken: string): Promise<{ valid: boolean; user?: any; error?: string }> {
  try {
    const response = await fetch(`${homeserverUrl}/_matrix/client/r0/account/whoami`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return {
        valid: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const user = await response.json();
    return {
      valid: true,
      user
    };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Test MMR connectivity using datastores endpoint
export async function testMMRConnection(baseUrl: string, accessToken: string): Promise<{ valid: boolean; error?: string }> {
  try {
    const response = await fetch(`${baseUrl}/_matrix/media/unstable/admin/datastores?access_token=${accessToken}`);

    if (!response.ok) {
      return {
        valid: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export { MMRApiClient };
