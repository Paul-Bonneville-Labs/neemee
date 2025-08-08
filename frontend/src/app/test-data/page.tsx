'use client';

import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface TestDataStats {
  totalNotes: number;
  testNotes: number;
  realNotes: number;
}

export default function TestDataPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<TestDataStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load stats on component mount
  React.useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/generate-test-data', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setStats(result.data);
      } else {
        setMessage(`Error: ${response.statusText}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateTestData = async (count: number, timeSpread: 'week' | 'month' | '6months', clear: boolean = false) => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/generate-test-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          count,
          timeSpread,
          clear
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        setMessage(`✅ ${result.message}`);
        await loadStats(); // Refresh stats
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearTestData = async () => {
    setIsLoading(true);
    setMessage('');
    
    try {
      const response = await fetch('/api/generate-test-data', {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        const result = await response.json();
        setMessage(`✅ ${result.message}`);
        await loadStats(); // Refresh stats
      } else {
        const error = await response.json();
        setMessage(`❌ Error: ${error.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading spinner during authentication
  if (loading || (!loading && !user)) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-base-content/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-base-content mb-2">Test Data Generator</h1>
          <p className="text-base-content/70">Generate realistic test notes for pagination and UI testing</p>
        </div>

        {/* Current Stats */}
        <div className="card bg-base-200 shadow-sm mb-8">
          <div className="card-body">
            <h2 className="card-title">Current Data Status</h2>
            {stats ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="stat bg-base-100 rounded-lg">
                  <div className="stat-title">Total Notes</div>
                  <div className="stat-value text-primary">{stats.totalNotes}</div>
                </div>
                <div className="stat bg-base-100 rounded-lg">
                  <div className="stat-title">Test Notes</div>
                  <div className="stat-value text-secondary">{stats.testNotes}</div>
                </div>
                <div className="stat bg-base-100 rounded-lg">
                  <div className="stat-title">Real Notes</div>
                  <div className="stat-value text-accent">{stats.realNotes}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="loading loading-spinner loading-sm"></div>
                <span>Loading stats...</span>
              </div>
            )}
            <div className="card-actions">
              <button 
                className="btn btn-sm btn-outline"
                onClick={loadStats}
                disabled={isLoading}
              >
                Refresh Stats
              </button>
            </div>
          </div>
        </div>

        {/* Generation Options */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Quick Generation */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <h3 className="card-title">Quick Generation</h3>
              <p className="text-sm text-base-content/70 mb-4">
                Generate test data with common configurations
              </p>
              <div className="space-y-3">
                <button 
                  className="btn btn-primary btn-block"
                  onClick={() => generateTestData(50, 'week', false)}
                  disabled={isLoading}
                >
                  Generate 50 Notes (1 Week)
                </button>
                <button 
                  className="btn btn-secondary btn-block"
                  onClick={() => generateTestData(150, 'month', false)}
                  disabled={isLoading}
                >
                  Generate 150 Notes (1 Month)
                </button>
                <button 
                  className="btn btn-accent btn-block"
                  onClick={() => generateTestData(300, '6months', false)}
                  disabled={isLoading}
                >
                  Generate 300 Notes (6 Months)
                </button>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body">
              <h3 className="card-title">Advanced Options</h3>
              <p className="text-sm text-base-content/70 mb-4">
                Full dataset replacement for comprehensive testing
              </p>
              <div className="space-y-3">
                <button 
                  className="btn btn-warning btn-block"
                  onClick={() => generateTestData(200, '6months', true)}
                  disabled={isLoading}
                >
                  Fresh 200 Notes (Clear + Generate)
                </button>
                <button 
                  className="btn btn-info btn-block"
                  onClick={() => generateTestData(500, '6months', true)}
                  disabled={isLoading}
                >
                  Fresh 500 Notes (Clear + Generate)
                </button>
                <button 
                  className="btn btn-error btn-outline btn-block"
                  onClick={clearTestData}
                  disabled={isLoading}
                >
                  Clear All Test Data
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className="alert mb-8">
            <span>{message}</span>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-base-100 rounded-lg p-8 text-center">
              <div className="loading loading-spinner loading-lg mb-4"></div>
              <p>Generating test data...</p>
              <p className="text-sm text-base-content/70">This may take a few seconds</p>
            </div>
          </div>
        )}

        {/* Back to Library */}
        <div className="text-center">
          <button 
            className="btn btn-ghost"
            onClick={() => router.push('/')}
          >
            ← Back to Library
          </button>
        </div>
      </div>
    </div>
  );
}