'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  HardDrive, 
  Activity,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Image,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatBytes } from '@/lib/utils';
import { getMMRApi } from '@/lib/mmr-api';

interface DatastoreInfo {
  id: string;
  type: string;
  uri: string;
  healthy?: boolean;
  lastCheck?: string;
  sizeEstimate?: {
    thumbnails_affected: number;
    thumbnail_hashes_affected: number;
    thumbnail_bytes: number;
    media_affected: number;
    media_hashes_affected: number;
    media_bytes: number;
    total_hashes_affected: number;
    total_bytes: number;
  };
}

export function DatastoresOverview() {
  const [datastores, setDatastores] = useState<DatastoreInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDatastores = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const api = getMMRApi();
        const datastoresData = await api.getDatastores();
        
        // Convert the response to an array format and load size estimates
        const datastoresArray = await Promise.all(
          Object.entries(datastoresData).map(async ([id, info]) => {
            try {
              // Get size estimate for each datastore
              const sizeEstimate = await api.getDatastoreSizeEstimate(id);
              return {
                id,
                type: info.type,
                uri: info.uri,
                healthy: true,
                lastCheck: new Date().toISOString(),
                sizeEstimate
              };
            } catch (err) {
              console.warn(`Failed to get size estimate for datastore ${id}:`, err);
              return {
                id,
                type: info.type,
                uri: info.uri,
                healthy: true,
                lastCheck: new Date().toISOString(),
                sizeEstimate: undefined
              };
            }
          })
        );
        
        setDatastores(datastoresArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load datastores');
      } finally {
        setLoading(false);
      }
    };

    loadDatastores();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Datastores</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner size="md" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Datastores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datastores</CardTitle>
      </CardHeader>
      <CardContent>
        {datastores.length === 0 ? (
          <div className="text-center py-8">
            <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No datastores found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {datastores.map((datastore) => (
              <div
                key={datastore.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Datastore Header */}
                <div className="flex items-center justify-between p-4 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {datastore.type === 's3' ? (
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Database className="h-5 w-5 text-blue-600" />
                        </div>
                      ) : datastore.type === 'file' ? (
                        <div className="p-2 bg-green-100 rounded-full">
                          <HardDrive className="h-5 w-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="p-2 bg-gray-100 rounded-full">
                          <Database className="h-5 w-5 text-gray-600" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {datastore.type.toUpperCase()} Datastore
                        </p>
                        {datastore.healthy ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {datastore.uri}
                      </p>
                      <p className="text-xs text-gray-400">
                        ID: {datastore.id}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      datastore.healthy 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {datastore.healthy ? 'Healthy' : 'Unhealthy'}
                    </span>
                  </div>
                </div>

                {/* Datastore Stats */}
                {datastore.sizeEstimate && (
                  <div className="p-4 bg-white">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <FileText className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">Media Files</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {datastore.sizeEstimate.media_affected.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatBytes(datastore.sizeEstimate.media_bytes)}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Image className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">Thumbnails</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {datastore.sizeEstimate.thumbnails_affected.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatBytes(datastore.sizeEstimate.thumbnail_bytes)}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Database className="h-4 w-4 text-purple-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">Total Files</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {datastore.sizeEstimate.total_hashes_affected.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatBytes(datastore.sizeEstimate.total_bytes)}
                        </p>
                      </div>
                      
                      <div className="text-center">
                        <div className="flex items-center justify-center mb-1">
                          <Activity className="h-4 w-4 text-orange-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900">Unique Hashes</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900">
                          {(datastore.sizeEstimate.media_hashes_affected + datastore.sizeEstimate.thumbnail_hashes_affected).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {datastore.sizeEstimate.media_hashes_affected} media + {datastore.sizeEstimate.thumbnail_hashes_affected} thumbnails
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!datastore.sizeEstimate && (
                  <div className="p-4 bg-white text-center">
                    <p className="text-sm text-gray-500">Size estimate unavailable</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
