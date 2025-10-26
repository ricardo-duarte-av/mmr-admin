'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Eye, 
  Trash2, 
  Clock,
  User,
  Server
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MediaFile } from '@/types/mmr';
import { formatBytes, formatRelativeTime, getFileIcon, isImageFile } from '@/lib/utils';
import { getMMRApi } from '@/lib/mmr-api';

interface RecentMediaProps {
  onMediaSelect: (media: MediaFile) => void;
}

export function RecentMedia({ onMediaSelect }: RecentMediaProps) {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecentMedia = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const api = getMMRApi();
        // Use the server usage endpoint instead of uploads to avoid massive responses
        const response = await api.getMediaList();
        
        // The server usage endpoint returns summary data, not individual media files
        // For recent media, we'll show a message that individual media browsing is available
        // in the Media tab instead of trying to load potentially massive data
        setMedia([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recent media');
      } finally {
        setLoading(false);
      }
    };

    loadRecentMedia();
  }, []);

  const handleDownload = async (media: MediaFile) => {
    try {
      const api = getMMRApi();
      const blob = await api.downloadMedia(media.mediaId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = media.uploadName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const handleDelete = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;
    
    try {
      const api = getMMRApi();
      await api.deleteMedia(mediaId);
      setMedia(prev => prev.filter(m => m.mediaId !== mediaId));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Media</CardTitle>
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
          <CardTitle>Recent Media</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-center py-4">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Media</CardTitle>
      </CardHeader>
      <CardContent>
      {media.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Recent media browsing disabled</p>
          <p className="text-xs text-gray-400">
            Use the Media tab to browse individual files safely
          </p>
        </div>
      ) : (
          <div className="space-y-3">
            {media.map((item) => (
              <div
                key={item.mediaId}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex-shrink-0">
                  {isImageFile(item.contentType) ? (
                    <img
                      src={getMMRApi().getMediaUrl(item.mediaId)}
                      alt={item.uploadName}
                      className="h-12 w-12 object-cover rounded"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-xl">
                      {getFileIcon(item.contentType)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.uploadName}
                  </p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span className="flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {item.userId}
                    </span>
                    <span className="flex items-center">
                      <Server className="h-3 w-3 mr-1" />
                      {item.serverName}
                    </span>
                    <span>{formatBytes(item.sizeBytes)}</span>
                    <span>{formatRelativeTime(item.uploadDate)}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onMediaSelect(item)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDownload(item)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(item.mediaId)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
