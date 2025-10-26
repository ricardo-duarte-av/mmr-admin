'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  HardDrive, 
  Activity,
  AlertCircle,
  CheckCircle,
  ExternalLink
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
        
        // Convert the response to an array format
        const datastoresArray = Object.entries(datastoresData).map(([id, info]) => ({
          id,
          type: info.type,
          uri: info.uri,
          healthy: true, // Assume healthy if we can fetch the data
          lastCheck: new Date().toISOString()
        }));
        
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
          <div className="space-y-4">
            {datastores.map((datastore) => (
              <div
                key={datastore.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
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
                      <p className="text-sm font-medium text-gray-900 truncate">
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
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
