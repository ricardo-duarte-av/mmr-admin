'use client';

import React, { useState } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  Calendar,
  User,
  Hash,
  Server,
  Clock,
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMMRApi } from '@/lib/mmr-api';

interface PurgeResult {
  success: boolean;
  message: string;
  details?: any;
}

export function MediaPurgeInterface() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<PurgeResult[]>([]);
  const [beforeDateTime, setBeforeDateTime] = useState<string>('');
  const [includeLocal, setIncludeLocal] = useState<boolean>(false);

  const formatTimestamp = (date: Date): string => {
    return date.getTime().toString();
  };

  const getCurrentDateTime = (): string => {
    const now = new Date();
    // Format as YYYY-MM-DDTHH:MM for datetime-local input
    return now.toISOString().slice(0, 16);
  };

  const getDateTime30DaysAgo = (): string => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return thirtyDaysAgo.toISOString().slice(0, 16);
  };

  const handlePurgeRemote = async () => {
    if (!beforeDateTime) {
      setResults(prev => [...prev, {
        success: false,
        message: 'Please specify a date and time for remote media purge'
      }]);
      return;
    }

    setLoading('remote');
    try {
      const api = getMMRApi();
      const timestamp = new Date(beforeDateTime).getTime();
      await api.purgeRemoteMedia(timestamp);
      setResults(prev => [...prev, {
        success: true,
        message: 'Remote media purge completed successfully'
      }]);
    } catch (error) {
      setResults(prev => [...prev, {
        success: false,
        message: `Remote media purge failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
    } finally {
      setLoading(null);
    }
  };

  const handlePurgeQuarantined = async () => {
    setLoading('quarantined');
    try {
      const api = getMMRApi();
      await api.purgeQuarantinedMedia();
      setResults(prev => [...prev, {
        success: true,
        message: 'Quarantined media purge completed successfully'
      }]);
    } catch (error) {
      setResults(prev => [...prev, {
        success: false,
        message: `Quarantined media purge failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
    } finally {
      setLoading(null);
    }
  };

  const handlePurgeOld = async () => {
    const timestamp = beforeDateTime ? new Date(beforeDateTime).getTime() : Date.now();
    setLoading('old');
    try {
      const api = getMMRApi();
      await api.purgeOldMedia(timestamp, includeLocal);
      setResults(prev => [...prev, {
        success: true,
        message: `Old media purge completed successfully (include_local: ${includeLocal})`
      }]);
    } catch (error) {
      setResults(prev => [...prev, {
        success: false,
        message: `Old media purge failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }]);
    } finally {
      setLoading(null);
    }
  };

  const purgeActions = [
    {
      id: 'remote',
      title: 'Purge Remote Media',
      description: 'Delete remote media downloaded before a specific timestamp',
      icon: Server,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      requiresTimestamp: true,
      handler: handlePurgeRemote,
      warning: 'Remote media will be re-downloaded if requested again'
    },
    {
      id: 'quarantined',
      title: 'Purge Quarantined Media',
      description: 'Delete all previously quarantined media',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      requiresTimestamp: false,
      handler: handlePurgeQuarantined,
      warning: 'This will permanently delete quarantined content'
    },
    {
      id: 'old',
      title: 'Purge Old Media',
      description: 'Delete media that hasn\'t been accessed recently',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      requiresTimestamp: true,
      handler: handlePurgeOld,
      warning: 'Only affects media not accessed since the timestamp'
    }
  ];

  const purgeByTarget = [
    {
      id: 'user',
      title: 'Purge by User',
      description: 'Delete all media uploaded by a specific user',
      icon: User,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      placeholder: '@user:domain.com',
      endpoint: 'user'
    },
    {
      id: 'room',
      title: 'Purge by Room',
      description: 'Delete all media from a specific room',
      icon: Hash,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      placeholder: '!roomid:domain.com',
      endpoint: 'room'
    },
    {
      id: 'server',
      title: 'Purge by Server',
      description: 'Delete all media uploaded by a specific server',
      icon: Server,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      placeholder: 'domain.com',
      endpoint: 'server'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Media Purge</h1>
        <p className="text-gray-600 mt-2">
          Manage media deletion and cleanup operations
        </p>
      </div>

      {/* Date/Time Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Date & Time Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Before Date & Time
            </label>
            <Input
              type="datetime-local"
              value={beforeDateTime}
              onChange={(e) => setBeforeDateTime(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to use current time. Use{' '}
              <button
                onClick={() => setBeforeDateTime(getCurrentDateTime())}
                className="text-primary-600 hover:underline"
              >
                current time
              </button>
              {' '}or{' '}
              <button
                onClick={() => setBeforeDateTime(getDateTime30DaysAgo())}
                className="text-primary-600 hover:underline"
              >
                30 days ago
              </button>
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="includeLocal"
              checked={includeLocal}
              onChange={(e) => setIncludeLocal(e.target.checked)}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="includeLocal" className="text-sm text-gray-700">
              Include local media (for old media purge)
            </label>
          </div>
        </CardContent>
      </Card>

      {/* General Purge Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purgeActions.map((action) => {
          const Icon = action.icon;
          return (
            <Card key={action.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${action.bgColor}`}>
                    <Icon className={`h-5 w-5 ${action.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{action.title}</CardTitle>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-600">{action.warning}</p>
                </div>
                
                <Button
                  onClick={action.handler}
                  disabled={loading === action.id || (action.requiresTimestamp && !beforeDateTime)}
                  variant="danger"
                  className="w-full"
                >
                  {loading === action.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Purging...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Purge
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Purge by Target */}
      <Card>
        <CardHeader>
          <CardTitle>Purge by Target</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {purgeByTarget.map((target) => {
              const Icon = target.icon;
              const [inputValue, setInputValue] = useState('');
              
              const handlePurgeByTarget = async () => {
                if (!inputValue.trim()) {
                  setResults(prev => [...prev, {
                    success: false,
                    message: `Please specify a ${target.id} ID`
                  }]);
                  return;
                }

                setLoading(target.id);
                try {
                  const api = getMMRApi();
                  const timestamp = beforeDateTime ? new Date(beforeDateTime).getTime() : Date.now();
                  
                  if (target.endpoint === 'user') {
                    await api.purgeUserMedia(inputValue.trim(), timestamp);
                  } else if (target.endpoint === 'room') {
                    await api.purgeRoomMedia(inputValue.trim(), timestamp);
                  } else if (target.endpoint === 'server') {
                    await api.purgeServerMedia(inputValue.trim(), timestamp);
                  }
                  
                  setResults(prev => [...prev, {
                    success: true,
                    message: `${target.title} purge completed successfully`
                  }]);
                } catch (error) {
                  setResults(prev => [...prev, {
                    success: false,
                    message: `${target.title} purge failed: ${error instanceof Error ? error.message : 'Unknown error'}`
                  }]);
                } finally {
                  setLoading(null);
                }
              };

              return (
                <div key={target.id} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-full ${target.bgColor}`}>
                      <Icon className={`h-4 w-4 ${target.color}`} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{target.title}</h3>
                      <p className="text-xs text-gray-500">{target.description}</p>
                    </div>
                  </div>
                  
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={target.placeholder}
                    className="w-full"
                  />
                  
                  <Button
                    onClick={handlePurgeByTarget}
                    disabled={loading === target.id || !inputValue.trim()}
                    variant="danger"
                    size="sm"
                    className="w-full"
                  >
                    {loading === target.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                        Purging...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3 mr-2" />
                        Purge
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Purge Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-3 rounded-lg ${
                    result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  )}
                  <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.message}
                  </p>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setResults([])}
              variant="secondary"
              size="sm"
              className="mt-4"
            >
              Clear Results
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
