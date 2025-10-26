'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Users, 
  HardDrive, 
  Activity,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ServerStats, ServerHealth } from '@/types/mmr';
import { formatBytes } from '@/lib/utils';
import { getMMRApi } from '@/lib/mmr-api';

export function StatsCards() {
  const [stats, setStats] = useState<ServerStats | null>(null);
  const [health, setHealth] = useState<ServerHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const api = getMMRApi();
        const [statsData, healthData, datastoresData] = await Promise.all([
          api.getServerStats(),
          api.getServerHealth(),
          api.getDatastores()
        ]);
        
        setStats(statsData);
        setHealth(healthData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <LoadingSpinner size="md" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Extract data from MMR API response
  const totalMedia = stats?.raw_counts?.total || 0;
  const totalSize = stats?.raw_bytes?.total || 0;
  const mediaCount = stats?.raw_counts?.media || 0;
  const thumbnailCount = stats?.raw_counts?.thumbnails || 0;
  const mediaSize = stats?.raw_bytes?.media || 0;
  const thumbnailSize = stats?.raw_bytes?.thumbnails || 0;

  const statsCards = [
    {
      title: 'Total Media',
      value: totalMedia.toLocaleString(),
      icon: Database,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: `${mediaCount} media, ${thumbnailCount} thumbnails`,
      changeType: 'positive' as const,
    },
    {
      title: 'Media Files',
      value: mediaCount.toLocaleString(),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: `${formatBytes(mediaSize)}`,
      changeType: 'positive' as const,
    },
    {
      title: 'Storage Used',
      value: formatBytes(totalSize),
      icon: HardDrive,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: `${formatBytes(thumbnailSize)} thumbnails`,
      changeType: 'positive' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statsCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-full ${card.bgColor}`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </div>
              <div className="flex items-center text-xs">
                {card.changeType === 'positive' ? (
                  <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-600 mr-1" />
                )}
                <span className={card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}>
                  {card.change}
                </span>
                <span className="text-gray-500 ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
