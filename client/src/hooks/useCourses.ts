import { useApi } from './useApi';
import { apiService } from '../lib/axios';
import { Course, CreateCourse } from '@shared/schema';
import { useCallback } from 'react';

// Hook to get all courses
export const useGetCourses = () => {
  const apiCall = useCallback(() => apiService.get<Course[]>('/courses'), []);
  
  return useApi<Course[]>(apiCall, {
    showLoading: true,
    showNotifications: false,
  });
};

// Hook to get a specific course
export const useGetCourse = (id: number) => {
  const apiCall = useCallback(() => apiService.get<Course>(`/courses/${id}`), [id]);
  
  return useApi<Course>(apiCall, {
    showLoading: true,
    showNotifications: false,
  });
};



// Hook to create a course
export const useCreateCourse = () => {
  return useApi<Course>((courseData: CreateCourse) => 
    apiService.post<Course>('/admin/courses', courseData), {
    showLoading: true,
    showNotifications: true,
  });
};

// Hook to update a course
export const useUpdateCourse = () => {
  return useApi<Course>(({ id, ...courseData }: { id: number } & Partial<CreateCourse>) => 
    apiService.patch<Course>(`/admin/courses/${id}`, courseData), {
    showLoading: true,
    showNotifications: true,
  });
};

// Hook to delete a course
export const useDeleteCourse = () => {
  return useApi<void>((id: number) => 
    apiService.delete<void>(`/admin/courses/${id}`), {
    showLoading: true,
    showNotifications: true,
  });
};

// Hook to get courses for diploma level
export const useGetDiplomaCourses = (diplomaLevel: string) => {
  console.log('🎓 useGetDiplomaCourses called with level:', diplomaLevel, 'at:', new Date().toISOString());
  
  const apiCall = useCallback(() => {
    console.log('🎓 useGetDiplomaCourses apiCall executing for level:', diplomaLevel);
    return apiService.get<Course[]>(`/courses?level=${diplomaLevel}`);
  }, [diplomaLevel]);
  
  return useApi<Course[]>(apiCall, {
    showLoading: true,
    showNotifications: false,
  });
};

// Hook to get courses by level (for filtering)
export const useGetCoursesByLevel = (level: string) => {
  const apiCall = useCallback(() => 
    apiService.get<Course[]>(`/courses?level=${level}`), [level]);
  
  return useApi<Course[]>(apiCall, {
    showLoading: true,
    showNotifications: false,
  });
};

// Hook to initialize university courses (admin only)
export const useInitializeCourses = () => {
  return useApi<{ message: string; courses: Course[] }>(() => 
    apiService.post<{ message: string; courses: Course[] }>('/admin/initialize-courses'), {
    showLoading: true,
    showNotifications: true,
  });
};