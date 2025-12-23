'use client';

import { useState, useEffect } from 'react';

export default function Introduction() {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect(() => {
  //   fetchWallets();
  // }, []);

  // const fetchWallets = async () => {
  //   try {
  //     const response = await fetch('/api/waltid/wallets');
  //     if (response.ok) {
  //       const data = await response.json();
  //       setWallets(Array.isArray(data.wallets) ? data.wallets : []);
  //     } else {
  //       setError('Failed to fetch wallets');
  //     }
  //   } catch (err) {
  //     setError('Error fetching wallets');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Introduction to EDC</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">What is Eclipse Dataspace Connector?</h2>
        <p className="text-gray-700 mb-4">
          The Eclipse Dataspace Connector (EDC) is a framework for building data spaces and enabling secure, 
          sovereign data exchange between organizations. It provides the foundation for creating federated 
          data ecosystems where participants can share data while maintaining control and governance.
        </p>
        <h3 className="text-lg font-semibold mb-3">Key Features:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-2">
          <li>Secure data transfer protocols</li>
          <li>Policy-based access control</li>
          <li>Contract negotiation capabilities</li>
          <li>Asset management and cataloging</li>
          <li>Identity and trust management</li>
        </ul>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Your Wallets</h2>
        {loading ? (
          <p className="text-gray-600">Loading wallets...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : wallets.length > 0 ? (
          <div className="space-y-3">
            {wallets.map((wallet, index) => (
              <div key={index} className="border border-gray-200 p-3 rounded">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(wallet, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No wallets found</p>
        )}
      </div>
    </div>
  );
}