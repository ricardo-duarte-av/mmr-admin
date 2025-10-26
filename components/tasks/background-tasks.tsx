'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Eye,
  Calendar,
  Database,
  HardDrive,
  Activity,
  Loader
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { getMMRApi } from '@/lib/mmr-api';

interface TaskParams {
  [key: string]: any;
}

interface BackgroundTask {
  task_id: number;
  task_name: string;
  params: TaskParams;
  start_ts: number;
  end_ts: number;
  is_finished: boolean;
  error_message: string;
}

export function BackgroundTasksInterface() {
  const [allTasks, setAllTasks] = useState<BackgroundTask[]>([]);
  const [unfinishedTasks, setUnfinishedTasks] = useState<BackgroundTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<BackgroundTask | null>(null);
  const [loading, setLoading] = useState<{ all: boolean; unfinished: boolean; task: boolean }>({
    all: false,
    unfinished: false,
    task: false
  });
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'unfinished'>('all');

  const formatTimestamp = (timestamp: number): string => {
    if (timestamp === 0) return 'Not finished';
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (startTs: number, endTs: number): string => {
    if (endTs === 0) {
      const duration = Date.now() - startTs;
      return `${Math.floor(duration / 1000)}s (running)`;
    }
    const duration = endTs - startTs;
    return `${Math.floor(duration / 1000)}s`;
  };

  const getTaskIcon = (taskName: string) => {
    switch (taskName) {
      case 'storage_migration':
        return <HardDrive className="h-4 w-4" />;
      case 'quarantine':
        return <AlertTriangle className="h-4 w-4" />;
      case 'purge':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getTaskStatusIcon = (task: BackgroundTask) => {
    if (task.error_message) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else if (task.is_finished) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else {
      return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getTaskStatusColor = (task: BackgroundTask) => {
    if (task.error_message) {
      return 'text-red-600 bg-red-100';
    } else if (task.is_finished) {
      return 'text-green-600 bg-green-100';
    } else {
      return 'text-blue-600 bg-blue-100';
    }
  };

  const loadAllTasks = async () => {
    setLoading(prev => ({ ...prev, all: true }));
    setError(null);
    try {
      const api = getMMRApi();
      const tasks = await api.getAllTasks();
      setAllTasks(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load all tasks');
    } finally {
      setLoading(prev => ({ ...prev, all: false }));
    }
  };

  const loadUnfinishedTasks = async () => {
    setLoading(prev => ({ ...prev, unfinished: true }));
    setError(null);
    try {
      const api = getMMRApi();
      const tasks = await api.getUnfinishedTasks();
      setUnfinishedTasks(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load unfinished tasks');
    } finally {
      setLoading(prev => ({ ...prev, unfinished: false }));
    }
  };

  const loadTaskDetails = async (taskId: number) => {
    setLoading(prev => ({ ...prev, task: true }));
    setError(null);
    try {
      const api = getMMRApi();
      const task = await api.getTaskDetails(taskId);
      setSelectedTask(task);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task details');
    } finally {
      setLoading(prev => ({ ...prev, task: false }));
    }
  };

  const refreshTasks = () => {
    if (activeTab === 'all') {
      loadAllTasks();
    } else {
      loadUnfinishedTasks();
    }
  };

  useEffect(() => {
    loadAllTasks();
    loadUnfinishedTasks();
  }, []);

  const currentTasks = activeTab === 'all' ? allTasks : unfinishedTasks;
  const currentLoading = activeTab === 'all' ? loading.all : loading.unfinished;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Background Tasks</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage background tasks in your MMR instance
          </p>
        </div>
        <Button onClick={refreshTasks} variant="secondary">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Task Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Tasks ({allTasks.length})
        </button>
        <button
          onClick={() => setActiveTab('unfinished')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'unfinished'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Unfinished ({unfinishedTasks.length})
        </button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <p className="text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                {activeTab === 'all' ? 'All Tasks' : 'Unfinished Tasks'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : currentTasks.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tasks found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentTasks.map((task) => (
                    <div
                      key={task.task_id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedTask?.task_id === task.task_id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
                      }`}
                      onClick={() => loadTaskDetails(task.task_id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getTaskIcon(task.task_name)}
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {task.task_name.replace('_', ' ').toUpperCase()}
                            </h3>
                            <p className="text-sm text-gray-500">Task ID: {task.task_id}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task)}`}>
                            {getTaskStatusIcon(task)}
                            <span className="ml-1">
                              {task.error_message ? 'Error' : task.is_finished ? 'Finished' : 'Running'}
                            </span>
                          </span>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              loadTaskDetails(task.task_id);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>Started: {formatTimestamp(task.start_ts)}</span>
                          <span>Duration: {formatDuration(task.start_ts, task.end_ts)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Task Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                Task Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading.task ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="md" />
                </div>
              ) : selectedTask ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      {selectedTask.task_name.replace('_', ' ').toUpperCase()}
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Task ID:</span>
                        <span className="font-mono">{selectedTask.task_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(selectedTask)}`}>
                          {getTaskStatusIcon(selectedTask)}
                          <span className="ml-1">
                            {selectedTask.error_message ? 'Error' : selectedTask.is_finished ? 'Finished' : 'Running'}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Started:</span>
                        <span>{formatTimestamp(selectedTask.start_ts)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Finished:</span>
                        <span>{formatTimestamp(selectedTask.end_ts)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span>{formatDuration(selectedTask.start_ts, selectedTask.end_ts)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedTask.error_message && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <h4 className="font-medium text-red-800 mb-1">Error Message</h4>
                      <p className="text-sm text-red-700">{selectedTask.error_message}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Parameters</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                        {JSON.stringify(selectedTask.params, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Select a task to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
