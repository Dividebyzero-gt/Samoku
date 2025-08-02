import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Store } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminSetupService } from '../../services/adminSetupService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingUpAdmin, setIsSettingUpAdmin] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setError('');
    setIsSubmitting(true);

    try {
      const success = await login({ email, password });
      
      if (success) {
        console.log('Login successful, navigating to:', from);
        navigate(from, { replace: true });
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetupAdmin = async () => {
    console.log('LoginPage: handleSetupAdmin called');
    setIsSettingUpAdmin(true);
    setError('');

    try {
      console.log('LoginPage: Calling adminSetupService.setupAdmin()');
      const result = await adminSetupService.setupAdmin();
      console.log('LoginPage: Setup result:', result);
      
      if (result.success) {
        // Show success message and auto-fill credentials
        setEmail('admin@samoku.com');
        setPassword('Admin123!');
        setError('');
        // Show a temporary success message
        const tempDiv = document.createElement('div');
        tempDiv.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg z-50';
        tempDiv.textContent = 'Admin user created! Credentials filled in.';
        document.body.appendChild(tempDiv);
        setTimeout(() => document.body.removeChild(tempDiv), 3000);
      } else {
        console.error('LoginPage: Setup failed:', result.error);
        setError(result.error || 'Failed to setup admin user');
      }
    } catch (error) {
      console.error('LoginPage: Exception during setup:', error);
      setError('Failed to setup admin user');
    } finally {
      console.log('LoginPage: Setup completed, resetting loading state');
      setIsSettingUpAdmin(false);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Store className="h-12 w-12 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          Sign in to Samoku
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link
            to="/register"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Demo Admin Credentials Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Demo Admin Access</h4>
              <p className="text-sm text-blue-700 mb-2">Use these credentials to access the admin dashboard:</p>
              <div className="text-sm text-blue-800 font-mono">
                <p>Email: admin@samoku.com</p>
                <p>Password: Admin123!</p>
              </div>
              <div className="mt-2 space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@samoku.com');
                    setPassword('Admin123!');
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  Fill in admin credentials
                </button>
                <button
                  type="button"
                  onClick={handleSetupAdmin}
                  disabled={isSettingUpAdmin}
                  className="text-sm text-green-600 hover:text-green-700 underline disabled:opacity-50"
                >
                  {isSettingUpAdmin ? 'Creating admin...' : 'Create admin user'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;