'use client';

import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Trash2, 
  ExternalLink,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaFile } from '@/types/mmr';
import { formatBytes, formatDate, getFileIcon, isImageFile, isVideoFile, isAudioFile } from '@/lib/utils';
import { getMMRApi } from '@/lib/mmr-api';

interface MediaViewerProps {
  media: MediaFile | null;
  onClose: () => void;
  onDelete: (mediaId: string) => void;
}

export function MediaViewer({ media, onClose, onDelete }: MediaViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  if (!media) return null;

  const api = getMMRApi();
  const mediaUrl = api.getMediaUrl(media.mediaId);

  const handleDownload = async () => {
    try {
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this media?')) return;
    
    try {
      await api.deleteMedia(media.mediaId);
      onDelete(media.mediaId);
      onClose();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {media.uploadName}
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(mediaUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row">
          {/* Media Display */}
          <div className="flex-1 p-4">
            <div className="bg-gray-100 rounded-lg overflow-hidden">
              {isImageFile(media.contentType) ? (
                <img
                  src={mediaUrl}
                  alt={media.uploadName}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              ) : isVideoFile(media.contentType) ? (
                <div className="relative">
                  <video
                    src={mediaUrl}
                    className="w-full h-auto max-h-[60vh]"
                    controls
                    autoPlay={isPlaying}
                    muted={isMuted}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              ) : isAudioFile(media.contentType) ? (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">
                    {getFileIcon(media.contentType)}
                  </div>
                  <audio
                    src={mediaUrl}
                    controls
                    className="w-full"
                    autoPlay={isPlaying}
                    muted={isMuted}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4">
                    {getFileIcon(media.contentType)}
                  </div>
                  <p className="text-gray-600 mb-4">
                    Preview not available for this file type
                  </p>
                  <Button onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download to view
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Details Panel */}
          <div className="w-full lg:w-80 border-l border-gray-200 p-4">
            <Card>
              <CardHeader>
                <CardTitle>File Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Filename</label>
                  <p className="text-sm text-gray-900 break-all">{media.uploadName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Content Type</label>
                  <p className="text-sm text-gray-900">{media.contentType}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Size</label>
                  <p className="text-sm text-gray-900">{formatBytes(media.sizeBytes)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Upload Date</label>
                  <p className="text-sm text-gray-900">{formatDate(media.uploadDate)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">User</label>
                  <p className="text-sm text-gray-900">{media.userId}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Server</label>
                  <p className="text-sm text-gray-900">{media.serverName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Media ID</label>
                  <p className="text-sm text-gray-900 font-mono break-all">{media.mediaId}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Datastore</label>
                  <p className="text-sm text-gray-900">{media.datastoreIdStr}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <p className={`text-sm ${media.quarantined ? 'text-red-600' : 'text-green-600'}`}>
                    {media.quarantined ? 'Quarantined' : 'Active'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
