'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [formData, setFormData] = useState({
    verifiableCredentials: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.verifiableCredentials) {
      alert('Please fill in all fields');
      return;
    }

    setRegistering(true);

    try {
      const response = await fetch('/api/registration/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      
      if (response.ok) {
        alert('Successfully registered!');
        // Force a page reload to update the layout state
        window.location.reload();
      } else {
        alert(`Registration failed: ${data.error}`);
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              id="verifiableCredentials"
              name="verifiableCredentials"
              value={formData.verifiableCredentials}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your verifiable credentials"
              rows={4}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={registering}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {registering ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}