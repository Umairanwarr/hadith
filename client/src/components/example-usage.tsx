import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useLoading } from '@/contexts/LoadingContext';
import { useGet, usePost } from '@/hooks/useApi';

interface User {
  id: string;
  name: string;
  email: string;
}

interface CreateUserData {
  name: string;
  email: string;
}

export const ExampleUsage: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  
  // Context hooks
  const { user, isAuthenticated, login, logout } = useAuth();
  const { theme, setTheme, isDark } = useTheme();
  const { success, error, warning, info } = useNotifications();
  const { startLoading, stopLoading, isLoading } = useLoading();

  // API hooks
  const { data: users, loading: usersLoading, error: usersError, execute: fetchUsers } = useGet<User[]>('/api/users');
  const { execute: createUser } = usePost<User>('/api/users', {
    showNotifications: true,
    onSuccess: (data) => {
      success('User Created', 'User created successfully!');
      fetchUsers(); // Refresh the list
    },
    onError: (err) => {
      error('Error', 'Failed to create user');
    }
  });

  const handleLogin = async () => {
    try {
      startLoading('Logging in...');
      await login('test@example.com', 'password');
      success('Login Successful', 'Welcome back!');
    } catch (err) {
      error('Login Failed', 'Invalid credentials');
    } finally {
      stopLoading();
    }
  };

  const handleLogout = () => {
    logout();
    info('Logged Out', 'You have been logged out');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      warning('Validation Error', 'Please fill in all fields');
      return;
    }
    
    await createUser(formData);
    setFormData({ name: '', email: '' });
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    info('Theme Changed', `Theme changed to ${newTheme}`);
  };

  return (
    <div className={`p-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <h1 className="text-2xl font-bold mb-6">Context API & Axios Example</h1>

      {/* Authentication Section */}
      <section className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Authentication</h2>
        {isAuthenticated ? (
          <div>
            <p>Welcome, {user?.name}!</p>
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <button 
            onClick={handleLogin}
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        )}
      </section>

      {/* Theme Section */}
      <section className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Theme Management</h2>
        <div className="space-x-2">
          <button 
            onClick={() => handleThemeChange('light')}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Light
          </button>
          <button 
            onClick={() => handleThemeChange('dark')}
            className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
          >
            Dark
          </button>
          <button 
            onClick={() => handleThemeChange('system')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            System
          </button>
        </div>
        <p className="mt-2">Current theme: {theme}</p>
      </section>

      {/* Notifications Section */}
      <section className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        <div className="space-x-2">
          <button 
            onClick={() => success('Success!', 'This is a success message')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Success
          </button>
          <button 
            onClick={() => error('Error!', 'This is an error message')}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Error
          </button>
          <button 
            onClick={() => warning('Warning!', 'This is a warning message')}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Warning
          </button>
          <button 
            onClick={() => info('Info!', 'This is an info message')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Info
          </button>
        </div>
      </section>

      {/* API Section */}
      <section className="mb-8 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-4">API Calls</h2>
        
        {/* Create User Form */}
        <form onSubmit={handleCreateUser} className="mb-4">
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="border rounded px-3 py-2 w-full"
            />
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="border rounded px-3 py-2 w-full"
            />
            <button 
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Create User
            </button>
          </div>
        </form>

        {/* Fetch Users */}
        <div>
          <button 
            onClick={() => fetchUsers()}
            disabled={usersLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
          >
            {usersLoading ? 'Loading...' : 'Fetch Users'}
          </button>

          {usersError && (
            <p className="text-red-500">Error: {usersError}</p>
          )}

          {users && (
            <div>
              <h3 className="font-semibold mb-2">Users:</h3>
              <ul className="space-y-1">
                {users.map(user => (
                  <li key={user.id} className="p-2 bg-gray-100 rounded">
                    {user.name} ({user.email})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}; 