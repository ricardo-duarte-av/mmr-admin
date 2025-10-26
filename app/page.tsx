'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { DatastoresOverview } from '@/components/dashboard/datastores-overview';
import { MediaGallery } from '@/components/media/media-gallery';
import { MediaViewer } from '@/components/media/media-viewer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MediaFile } from '@/types/mmr';
import { initializeMMRApi, validateMatrixToken, testMMRConnection } from '@/lib/mmr-api';
import { isConfigComplete, getMMRConfig, getMatrixConfig } from '@/lib/config';

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedMedia, setSelectedMedia] = useState<MediaFile | null>(null);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Check if configuration is complete and valid
    const checkConfiguration = async () => {
      if (isConfigComplete()) {
        try {
          // Validate Matrix token first
          const matrixConfig = getMatrixConfig();
          const matrixValidation = await validateMatrixToken(matrixConfig.homeserverUrl, matrixConfig.accessToken);
          
          if (matrixValidation.valid) {
            // Test MMR connection
            const mmrConfig = getMMRConfig();
            const mmrValidation = await testMMRConnection(mmrConfig.baseUrl, mmrConfig.apiKey);
            
            if (mmrValidation.valid) {
              initializeMMRApi();
              setIsConfigured(true);
            } else {
              console.error('MMR connection failed:', mmrValidation.error);
            }
          } else {
            console.error('Matrix token validation failed:', matrixValidation.error);
          }
        } catch (error) {
          console.error('Configuration validation failed:', error);
        }
      } else {
        // Fallback to localStorage for manual configuration
        const homeserverUrl = localStorage.getItem('homeserver_url');
        const accessToken = localStorage.getItem('access_token');
        
        if (homeserverUrl && accessToken) {
          try {
            initializeMMRApi({ baseUrl: homeserverUrl, apiKey: accessToken });
            setIsConfigured(true);
          } catch (error) {
            console.error('Failed to initialize MMR API:', error);
          }
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
            
            <DatastoresOverview />
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
  const [homeserverUrl, setHomeserverUrl] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validationStep, setValidationStep] = useState<'matrix' | 'mmr' | 'complete'>('matrix');

  const handleSave = async () => {
    if (!homeserverUrl || !accessToken) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Validate Matrix token using whoami endpoint
      setValidationStep('matrix');
      const matrixValidation = await validateMatrixToken(homeserverUrl, accessToken);
      
      if (!matrixValidation.valid) {
        throw new Error(`Matrix token validation failed: ${matrixValidation.error}`);
      }

      // Step 2: Test MMR connection (using same URL and token)
      setValidationStep('mmr');
      const mmrValidation = await testMMRConnection(homeserverUrl, accessToken);
      
      if (!mmrValidation.valid) {
        throw new Error(`MMR connection failed: ${mmrValidation.error}`);
      }

      // Step 3: Save configuration
      setValidationStep('complete');
      localStorage.setItem('homeserver_url', homeserverUrl);
      localStorage.setItem('access_token', accessToken);
      
      // Initialize API client
      initializeMMRApi({ baseUrl: homeserverUrl, apiKey: accessToken });
      
      onConfigured();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Configuration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Configure MMR Admin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Homeserver URL
            </label>
            <input
              type="url"
              value={homeserverUrl}
              onChange={(e) => setHomeserverUrl(e.target.value)}
              placeholder="https://yourdomain.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              This URL is used for both Matrix and MMR API calls
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matrix Access Token
            </label>
            <input
              type="password"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Your Matrix access token"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              This token will be validated using the Matrix whoami endpoint
            </p>
          </div>
          
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          
          {loading && (
            <div className="text-sm text-gray-600">
              {validationStep === 'matrix' && 'Validating Matrix token...'}
              {validationStep === 'mmr' && 'Testing MMR connection...'}
              {validationStep === 'complete' && 'Saving configuration...'}
            </div>
          )}
          
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Validating...' : 'Save Configuration'}
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
