'use client';

import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Trash2, 
  Eye, 
  Search, 
  Filter,
  Grid,
  List,
  ChevronLeft,
  ChevronRight,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { MediaFile, MediaSearchParams } from '@/types/mmr';
import { formatBytes, formatRelativeTime, getFileIcon, isImageFile, isVideoFile } from '@/lib/utils';
import { getMMRApi } from '@/lib/mmr-api';

interface MediaGalleryProps {
  onMediaSelect: (media: MediaFile) => void;
}

export function MediaGallery({ onMediaSelect }: MediaGalleryProps) {
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState<Set<string>>(new Set());

  const itemsPerPage = 20;

  const loadMedia = async (page = 1, search = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const api = getMMRApi();
      // Use the server usage endpoint instead of uploads to avoid massive responses
      const response = await api.getMediaList();
      
      // The server usage endpoint returns summary data, not individual media files
      // We'll show a message explaining the limitation and provide alternative options
      setMedia([]);
      setTotalPages(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia(currentPage, searchTerm);
  }, [currentPage]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
    // Filter media client-side for now
    if (value) {
      const filtered = media.filter(m => 
        m.uploadName.toLowerCase().includes(value.toLowerCase()) ||
        m.contentType.toLowerCase().includes(value.toLowerCase()) ||
        m.userId.toLowerCase().includes(value.toLowerCase())
      );
      setMedia(filtered);
    } else {
      loadMedia(1, '');
    }
  };

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

  const handleBulkDownload = async () => {
    const selectedMediaList = media.filter(m => selectedMedia.has(m.mediaId));
    for (const mediaItem of selectedMediaList) {
      await handleDownload(mediaItem);
      // Add small delay to prevent overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const toggleSelection = (mediaId: string) => {
    setSelectedMedia(prev => {
      const newSet = new Set(prev);
      if (newSet.has(mediaId)) {
        newSet.delete(mediaId);
      } else {
        newSet.add(mediaId);
      }
      return newSet;
    });
  };

  if (loading && media.length === 0) {
    return <LoadingSpinner size="lg" className="mt-8" />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => loadMedia(currentPage, searchTerm)}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search media..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          
          {selectedMedia.size > 0 && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleBulkDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download ({selectedMedia.size})
            </Button>
          )}
        </div>
      </div>

      {/* Media Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? 'media-grid' 
          : 'space-y-2'
      }>
        {media.map((item) => (
          <Card 
            key={item.mediaId} 
            className={`media-item group cursor-pointer ${
              selectedMedia.has(item.mediaId) ? 'ring-2 ring-primary-500' : ''
            }`}
            onClick={() => onMediaSelect(item)}
          >
            <CardContent className="p-0">
              {viewMode === 'grid' ? (
                <div className="relative">
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {isImageFile(item.contentType) ? (
                      <img
                        src={getMMRApi().getMediaUrl(item.mediaId)}
                        alt={item.uploadName}
                        className="media-preview"
                        loading="lazy"
                      />
                    ) : isVideoFile(item.contentType) ? (
                      <video
                        src={getMMRApi().getMediaUrl(item.mediaId)}
                        className="media-preview"
                        controls={false}
                        muted
                      />
                    ) : (
                      <div className="text-4xl">
                        {getFileIcon(item.contentType)}
                      </div>
                    )}
                  </div>
                  
                  <div className="absolute top-2 left-2">
                    <input
                      type="checkbox"
                      checked={selectedMedia.has(item.mediaId)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelection(item.mediaId);
                      }}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMediaSelect(item);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(item);
                        }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item.mediaId);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center p-4 space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedMedia.has(item.mediaId)}
                    onChange={(e) => {
                      e.stopPropagation();
                      toggleSelection(item.mediaId);
                    }}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  
                  <div className="flex-shrink-0">
                    {isImageFile(item.contentType) ? (
                      <img
                        src={getMMRApi().getMediaUrl(item.mediaId)}
                        alt={item.uploadName}
                        className="h-12 w-12 object-cover rounded"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gray-100 rounded flex items-center justify-center text-2xl">
                        {getFileIcon(item.contentType)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.uploadName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.contentType} • {formatBytes(item.sizeBytes)} • {formatRelativeTime(item.uploadDate)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {item.userId}@{item.serverName}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onMediaSelect(item);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(item);
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.mediaId);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {media.length === 0 && !loading && (
        <div className="text-center py-12">
          <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Media browsing limited</h3>
          <p className="text-gray-500 mb-4">
            Individual media browsing is disabled to prevent loading massive datasets.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> The MMR uploads endpoint can return multiple megabytes of data.
              Use the Purge Media tab for bulk operations or query specific MXC URIs.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
