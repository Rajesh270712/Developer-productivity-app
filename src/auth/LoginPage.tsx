import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Lock } from 'lucide-react';

import { useAuth } from './AuthContext';
import TextField from '../components/TextField';
import Button from '../components/Button';
import Card from '../components/Card';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Try: alex@example.com (any password)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-lg text-white">
              <ClipboardList size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">DevLog</h1>
          <p className="mt-2 text-gray-600">Track your daily development progress</p>
        </div>
        
        <Card padding="large" shadow="lg" className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign In</h2>
          
          {error && (
            <div className="mb-6 p-3 rounded bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <TextField
                id="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                fullWidth
                icon={<Lock size={18} />}
              />
              
              <TextField
                id="password"
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                fullWidth
              />
              
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </div>
            </div>
          </form>
          
          <div className="mt-6 pt-5 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              For demo: Use email "alex@example.com" with any password
            </p>
          </div>
        </Card>
        
        <div className="text-center">
          <p className="text-sm text-gray-600">
            © 2025 DevLog. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;