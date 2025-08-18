import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { LanguageSwitcher } from '@/components/language-switcher';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Validation schema
const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

// API function
const resetPasswordApi = async (token: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    });

    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned an invalid response. Please check if the server is running.');
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Password reset failed');
    }

    return result;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please check if the server is running.');
    }
    throw error;
  }
};

const ResetPassword = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, currentLanguage } = useTranslation();
  const [resetStatus, setResetStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get token from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  // Form setup
  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: ({ password }: { password: string }) => resetPasswordApi(token!, password),
    onSuccess: (data) => {
      setResetStatus('success');
      toast({
        title: t('auth.passwordResetSuccess'),
        description: t('auth.passwordResetSuccessMessage'),
        duration: 5000,
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation('/auth');
      }, 3000);
    },
    onError: (error: any) => {
      setResetStatus('error');
      toast({
        variant: 'destructive',
        title: t('auth.passwordResetError'),
        description: error.message || t('auth.passwordResetErrorMessage'),
        duration: 5000,
      });
    },
  });

  // Check if token exists
  useEffect(() => {
    if (!token) {
      setResetStatus('error');
      toast({
        variant: 'destructive',
        title: t('auth.invalidToken'),
        description: t('auth.invalidTokenMessage'),
        duration: 5000,
      });
    }
  }, [token, toast, t]);

  const onSubmit = (data: ResetPasswordForm) => {
    if (!token) return;
    resetPasswordMutation.mutate({ password: data.password });
  };

  const renderContent = () => {
    if (!token || resetStatus === 'error') {
      return (
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 mx-auto text-red-500" />
          <h2 className="text-xl font-semibold text-red-600">{t('auth.invalidToken')}</h2>
          <p className="text-muted-foreground">{t('auth.invalidTokenMessage')}</p>
          <Button onClick={() => setLocation('/auth')} className="mt-4">
            {t('auth.backToLogin')}
          </Button>
        </div>
      );
    }

    if (resetStatus === 'success') {
      return (
        <div className="text-center space-y-4">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
          <h2 className="text-xl font-semibold text-green-600">{t('auth.passwordResetSuccess')}</h2>
          <p className="text-muted-foreground">{t('auth.passwordResetSuccessMessage')}</p>
          <p className="text-sm text-muted-foreground">{t('auth.redirectingToLogin')}</p>
          <Button onClick={() => setLocation('/auth')} className="mt-4">
            {t('auth.goToLogin')}
          </Button>
        </div>
      );
    }

    return (
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.newPassword')}</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              {...form.register('password')}
              placeholder={t('auth.enterNewPassword')}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              {...form.register('confirmPassword')}
              placeholder={t('auth.confirmNewPassword')}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={resetPasswordMutation.isPending}
        >
          {resetPasswordMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('auth.resettingPassword')}
            </>
          ) : (
            t('auth.resetPassword')
          )}
        </Button>

        <Button
          type="button"
          variant="link"
          onClick={() => setLocation('/auth')}
          className="w-full"
        >
          {t('auth.backToLogin')}
        </Button>
      </form>
    );
  };

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4 ${currentLanguage === 'ar' ? 'rtl' : 'ltr'}`}>
        <LanguageSwitcher />
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              {t('auth.resetPassword')}
            </CardTitle>
            <CardDescription>
              {t('auth.resetPasswordDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderContent()}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </>
  );
};

export default ResetPassword;
