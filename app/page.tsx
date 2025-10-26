'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { RecentMedia } from '@/components/dashboard/recent-media';
import { MediaGallery } from '@/components/media/media-gallery';
import { MediaViewer } from '@/components/media/media-viewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaFile } from '@/types/mmr';
import { initializeMMRApi } from '@/lib/mmr-api';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if MMR API is configured
    const checkConfiguration = () => {
      const baseUrl = localStorage.getItem('mmr_base_url');
      const apiKey = localStorage.getItem('mmr_api_key');
      
      if (baseUrl && apiKey) {
        try {
          initializeMMRApi({ baseUrl, apiKey });
          setIsConfigured(true);
        } catch (error) {
          console.error('Failed to initialize MMR API:', error);
        }
      }
    };

    checkConfiguration();
  }, []);

  const handleMediaSelect = (media: MediaFile) => {
    setSelectedMedia(media);
  };

  const handleMediaDelete = (mediaId: string) => {
    setSelectedMedia(null);
    // The media gallery will handle the actual deletion
  };

  const handleCloseViewer = () => {
    setSelectedMedia(null);
  };

  if (!isConfigured) {
    return <ConfigurationPage onConfigured={() => setIsConfigured(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Overview of your Matrix Media Repo instance
              </p>
            </div>
            
            <StatsCards />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RecentMedia onMediaSelect={handleMediaSelect} />
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <button
                    onClick={() => setCurrentPage('media')}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">Browse Media</h3>
                    <p className="text-sm text-gray-500">View and manage all media files</p>
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage('users')}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">User Management</h3>
                    <p className="text-sm text-gray-500">Monitor user activity and storage usage</p>
                  </button>
                  
                  <button
                    onClick={() => setCurrentPage('server')}
                    className="w-full text-left p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-medium text-gray-900">Server Status</h3>
                    <p className="text-sm text-gray-500">View server health and performance</p>
                  </button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentPage === 'media' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Media Management</h1>
              <p className="text-gray-600 mt-2">
                Browse, search, and manage media files
              </p>
            </div>
            
            <MediaGallery onMediaSelect={handleMediaSelect} />
          </div>
        )}

        {currentPage === 'users' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-2">
                Monitor user activity and storage usage
              </p>
            </div>
            
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">User management features coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {currentPage === 'server' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Server Status</h1>
              <p className="text-gray-600 mt-2">
                Monitor server health and performance
              </p>
            </div>
            
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Server monitoring features coming soon...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {currentPage === 'settings' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600 mt-2">
                Configure your MMR Admin interface
              </p>
            </div>
            
            <ConfigurationPage onConfigured={() => {}} />
          </div>
        )}
      </main>

      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          onClose={handleCloseViewer}
          onDelete={handleMediaDelete}
        />
      )}
    </div>
  );
}

function ConfigurationPage({ onConfigured }: { onConfigured: () => void }) {
  const [baseUrl, setBaseUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!baseUrl || !apiKey) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Test the connection
      const response = await fetch(`${baseUrl}/api/v1/server/health`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Save configuration
      localStorage.setItem('mmr_base_url', baseUrl);
      localStorage.setItem('mmr_api_key', apiKey);
      
      // Initialize API client
      initializeMMRApi({ baseUrl, apiKey });
      
      onConfigured();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to MMR API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Configure MMR API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              MMR Base URL
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your-mmr-instance.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Your MMR API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Connecting...' : 'Save Configuration'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
