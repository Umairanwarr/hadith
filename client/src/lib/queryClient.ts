import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    console.log('❌ QueryClient ERROR:', {
      status: res.status,
      statusText: res.statusText,
      errorText: text,
      timestamp: new Date().toISOString()
    });
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Get token from localStorage or sessionStorage
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Construct the full URL if it starts with /api/
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const fullUrl = url.startsWith('/api/') ? `${baseURL}${url.substring(4)}` : url;

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  // Handle authentication errors
  if (res.status === 401) {
    // Clear stored tokens
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');

    // Redirect to login page
    window.location.href = '/auth';
  }

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Get token from localStorage or sessionStorage
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    const headers: Record<string, string> = {};
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Construct the full URL with base URL
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    // Remove "/api" or "api" from the beginning of queryKey if it exists, since baseURL already includes it
    let path: string;
    if (queryKey[0] === "api" || queryKey[0] === "/api") {
      path = queryKey.slice(1).join("/");
    } else {
      path = queryKey.join("/");
    }
    // Remove leading slash from path to avoid double slash
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const url = `${baseURL}/${cleanPath}`;
    
    console.log('🔍 QueryClient DEBUG:', {
      queryKey,
      baseURL,
      path,
      cleanPath,
      constructedUrl: url,
      tokenExists: !!token,
      timestamp: new Date().toISOString()
    });
    
    const res = await fetch(url, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    console.log('✅ QueryClient SUCCESS:', {
      queryKey,
      status: res.status,
      dataLength: Array.isArray(data) ? data.length : 'not array',
      timestamp: new Date().toISOString()
    });
    return data;
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,

    },
    mutations: {
      retry: false,
    },
  },
});
