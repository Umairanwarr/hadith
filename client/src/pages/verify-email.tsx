import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useMutation } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { LanguageSwitcher } from '@/components/language-switcher';

// API Configuration  
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API functions
const verifyEmailApi = async (token: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned an invalid response. Please check if the server is running.');
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Email verification failed');
    }

    return result;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please check if the server is running.');
    }
    throw error;
  }
};

const resendVerificationApi = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('Server returned an invalid response. Please check if the server is running.');
    }

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Failed to resend verification email');
    }

    return result;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please check if the server is running.');
    }
    throw error;
  }
};

const VerifyEmail = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t, currentLanguage } = useTranslation();
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [email, setEmail] = useState('');
  const [showResendForm, setShowResendForm] = useState(false);

  // Get token from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  // Verify email mutation
  const verifyEmailMutation = useMutation({
    mutationFn: verifyEmailApi,
    onSuccess: (data) => {
      setVerificationStatus('success');
      toast({
        title: t('emailVerification.success'),
        description: t('emailVerification.successMessage'),
        duration: 5000,
      });
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        setLocation('/auth');
      }, 3000);
    },
    onError: (error: any) => {
      setVerificationStatus('error');
      toast({
        variant: 'destructive',
        title: t('emailVerification.error'),
        description: error.message || t('emailVerification.errorMessage'),
        duration: 5000,
      });
    },
  });

  // Resend verification mutation
  const resendVerificationMutation = useMutation({
    mutationFn: resendVerificationApi,
    onSuccess: (data) => {
      toast({
        title: t('emailVerification.resendSuccess'),
        description: t('emailVerification.resendSuccessMessage'),
        duration: 5000,
      });
      setShowResendForm(false);
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: t('emailVerification.resendError'),
        description: error.message || t('emailVerification.resendErrorMessage'),
        duration: 5000,
      });
    },
  });

  // Verify email on component mount if token exists
  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate(token);
    } else {
      setVerificationStatus('error');
    }
  }, [token]);

  const handleResendVerification = () => {
    if (email.trim()) {
      resendVerificationMutation.mutate(email);
    } else {
      toast({
        variant: 'destructive',
        title: t('validation.emailRequired'),
        description: t('emailVerification.enterEmailToResend'),
        duration: 3000,
      });
    }
  };

  const renderContent = () => {
    if (verificationStatus === 'pending') {
      return (
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">{t('emailVerification.verifying')}</h2>
          <p className="text-muted-foreground">{t('emailVerification.verifyingMessage')}</p>
        </div>
      );
    }

    if (verificationStatus === 'success') {
      return (
        <div className="text-center space-y-4">
          <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
          <h2 className="text-xl font-semibold text-green-600">{t('emailVerification.success')}</h2>
          <p className="text-muted-foreground">{t('emailVerification.successMessage')}</p>
          <p className="text-sm text-muted-foreground">{t('emailVerification.redirectingToLogin')}</p>
          <Button onClick={() => setLocation('/auth')} className="mt-4">
            {t('emailVerification.goToLogin')}
          </Button>
        </div>
      );
    }

    if (verificationStatus === 'error') {
      return (
        <div className="text-center space-y-4">
          <XCircle className="h-12 w-12 mx-auto text-red-500" />
          <h2 className="text-xl font-semibold text-red-600">{t('emailVerification.error')}</h2>
          <p className="text-muted-foreground">{t('emailVerification.errorMessage')}</p>
          
          {!showResendForm ? (
            <div className="space-y-2">
              <Button 
                variant="outline" 
                onClick={() => setShowResendForm(true)}
                className="w-full"
              >
                <Mail className="h-4 w-4 mr-2" />
                {t('emailVerification.resendVerification')}
              </Button>
              <Button 
                variant="link" 
                onClick={() => setLocation('/auth')}
                className="w-full"
              >
                {t('emailVerification.backToAuth')}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {t('auth.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.enterEmail')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={handleResendVerification}
                  disabled={resendVerificationMutation.isPending}
                  className="flex-1"
                >
                  {resendVerificationMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('auth.sending')}
                    </>
                  ) : (
                    t('emailVerification.resend')
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowResendForm(false)}
                  className="flex-1"
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <>
      <div className={`min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4 ${currentLanguage === 'ar' ? 'rtl' : 'ltr'}`}>
        <LanguageSwitcher />
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              {t('emailVerification.title')}
            </CardTitle>
            <CardDescription>
              {t('emailVerification.description')}
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

export default VerifyEmail;