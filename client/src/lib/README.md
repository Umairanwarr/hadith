# Axios and Context API Setup

This document describes the axios configuration and context API setup for the client application.

## Axios Configuration

### File: `client/src/lib/axios.ts`

The axios configuration includes:

- **Base Configuration**: Default timeout, credentials, and headers
- **Request Interceptors**: Automatically adds authentication tokens
- **Response Interceptors**: Handles authentication errors and server errors
- **API Service**: Wrapper methods for common HTTP operations

### Usage

```typescript
import { apiService } from '@/lib/axios';

// GET request
const data = await apiService.get<User>('/api/users');

// POST request
const newUser = await apiService.post<User>('/api/users', userData);

// PUT request
const updatedUser = await apiService.put<User>('/api/users/1', updateData);

// DELETE request
await apiService.delete('/api/users/1');

// PATCH request
const patchedUser = await apiService.patch<User>('/api/users/1', patchData);
```

## Context API Setup

### Available Contexts

1. **AuthContext** (`client/src/contexts/AuthContext.tsx`)
   - Manages user authentication state
   - Handles login, logout, and registration
   - Provides user information

2. **ThemeContext** (`client/src/contexts/ThemeContext.tsx`)
   - Manages light/dark theme
   - Supports system theme detection
   - Persists theme preference

3. **NotificationContext** (`client/src/contexts/NotificationContext.tsx`)
   - Manages toast notifications
   - Supports different notification types
   - Auto-dismiss functionality

4. **LoadingContext** (`client/src/contexts/LoadingContext.tsx`)
   - Manages global loading states
   - Progress tracking
   - Loading messages

5. **I18nContext** (`client/src/contexts/I18nContext.tsx`)
   - Internationalization support
   - Language switching
   - Translation management

### AppContextProvider

The `AppContextProvider` combines all contexts in the correct order:

```typescript
<AppContextProvider>
  {/* Your app components */}
</AppContextProvider>
```

### Usage Examples

#### Authentication

```typescript
import { useAuth } from '@/contexts';

function LoginComponent() {
  const { login, isAuthenticated, user, error } = useAuth();

  const handleLogin = async () => {
    try {
      await login(email, password);
      // Redirect or show success message
    } catch (error) {
      // Error is handled by the context
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Welcome, {user?.name}!</p>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

#### Theme Management

```typescript
import { useTheme } from '@/contexts';

function ThemeToggle() {
  const { theme, setTheme, isDark } = useTheme();

  return (
    <div>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
      <p>Current theme: {theme}</p>
    </div>
  );
}
```

#### Notifications

```typescript
import { useNotifications } from '@/contexts';

function NotificationExample() {
  const { success, error, warning, info } = useNotifications();

  const showSuccess = () => {
    success('Success!', 'Operation completed successfully');
  };

  const showError = () => {
    error('Error!', 'Something went wrong');
  };

  return (
    <div>
      <button onClick={showSuccess}>Show Success</button>
      <button onClick={showError}>Show Error</button>
    </div>
  );
}
```

#### Loading States

```typescript
import { useLoading } from '@/contexts';

function LoadingExample() {
  const { startLoading, stopLoading, isLoading, message } = useLoading();

  const handleLongOperation = async () => {
    startLoading('Processing...');
    try {
      await someAsyncOperation();
    } finally {
      stopLoading();
    }
  };

  return (
    <div>
      {isLoading && <p>{message}</p>}
      <button onClick={handleLongOperation}>Start Operation</button>
    </div>
  );
}
```

## Custom API Hooks

### File: `client/src/hooks/useApi.ts`

Provides custom hooks for API calls with built-in loading and error handling:

```typescript
import { useGet, usePost, usePut, useDelete } from '@/hooks/useApi';

function UserComponent() {
  const { data: users, loading, error, execute: fetchUsers } = useGet<User[]>('/api/users');
  const { execute: createUser } = usePost<User>('/api/users');

  const handleCreateUser = async (userData: UserData) => {
    const newUser = await createUser(userData);
    if (newUser) {
      // Handle success
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      {users && users.map(user => <p key={user.id}>{user.name}</p>)}
    </div>
  );
}
```

## Environment Variables

Create a `.env` file in the client directory:

```env
VITE_API_URL=http://localhost:3000
```

## Error Handling

The setup includes comprehensive error handling:

- **Authentication Errors**: Automatic logout and redirect
- **Server Errors**: Console logging and user notifications
- **Network Errors**: Graceful degradation
- **Validation Errors**: User-friendly error messages

## Best Practices

1. **Use the provided hooks** instead of direct axios calls
2. **Handle loading states** in your components
3. **Show user-friendly error messages**
4. **Use TypeScript interfaces** for type safety
5. **Test error scenarios** during development 