'use client';
import { useEffect, useState } from 'react';

export default function Ping() {
  const [healthData, setHealthData] = useState<any>(null);
  const [testData, setTestData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/ping');
        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
        } else {
          setHealthData(data.health);
          setTestData(data.test);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data from connector');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Connector Ping</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Health Check</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm">{JSON.stringify(healthData, null, 2)}</pre>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Test Endpoint</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm">{JSON.stringify(testData, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}