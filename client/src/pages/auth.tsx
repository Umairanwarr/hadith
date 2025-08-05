import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
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
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { setCookie } from '@/utils/cookies';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useTranslation } from '@/hooks/use-translation';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from 'wouter';

// API Configuration
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Forgot password API function (keeping this since AuthContext doesn't have it)
const forgotPasswordApi = async (data: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Reset failed');
    }

    return result;
  } catch (error: any) {
    if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
      throw new Error('NETWORK_ERROR');
    }
    throw error;
  }
};

const Auth = () => {
  const [currentView, setCurrentView] = useState('login');
  const [signupRole, setSignupRole] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const { t, currentLanguage } = useTranslation();
  const { login, register: authRegister, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect to dashboard when authenticated
  useEffect(() => {
    console.log('Auth useEffect triggered, isAuthenticated:', isAuthenticated);
    if (isAuthenticated) {
      console.log('Redirecting to dashboard...');
      setLocation('/');
      console.log('setLocation called');
    }
  }, [isAuthenticated, setLocation]);

  // React Hook Form configurations
  const loginForm = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      nationalId: '',
    },
  });

  const forgotPasswordForm = useForm({
    defaultValues: {
      email: '',
    },
  });

  // Error message helper
  const getErrorMessage = (error: any) => {
    if (error.message === 'NETWORK_ERROR') {
      return t('toast.networkError');
    }
    return error.message || t('toast.unexpectedError');
  };

  // TanStack Query Mutations
  const loginMutation = useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      await login(data.email, data.password);
    },
    onSuccess: () => {
      const roleName = t('auth.student');
      toast({
        title: t('toast.loginSuccess'),
        description: t('toast.loginWelcome', {
          name: '',
          role: roleName,
        }),
        duration: 3000,
      });
      
      // Force redirect to dashboard after successful login
      console.log('Login mutation success, redirecting to dashboard...');
      setTimeout(() => {
        setLocation('/');
      }, 100);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: t('toast.loginError'),
        description: getErrorMessage(error),
        duration: 4000,
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: any) => {
      await authRegister(data);
    },
    onSuccess: () => {
      const roleName = t('auth.student');
      toast({
        title: t('toast.signupSuccess'),
        description: t('toast.signupWelcome', {
          name: '',
          role: roleName,
        }),
        duration: 3000,
      });

      setCurrentView('login');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: t('toast.signupError'),
        description: getErrorMessage(error),
        duration: 4000,
      });
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: (data) => {
      toast({
        title: t('toast.resetLinkSent'),
        description: data.message || t('toast.resetLinkMessage'),
        duration: 5000,
      });
      setCurrentView('login');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: t('toast.resetError'),
        description: getErrorMessage(error),
        duration: 4000,
      });
    },
  });

  const onLoginSubmit = (data: any) => {
    loginMutation.mutate(data);
  };

  const onSignupSubmit = (data: any) => {
    if (data.password !== data.confirmPassword) {
      toast({
        variant: 'destructive',
        title: t('toast.passwordError'),
        description: t('validation.passwordMismatch'),
        duration: 3000,
      });
      return;
    }

    const { confirmPassword, ...submitData } = data;
    signupMutation.mutate({
      ...submitData,
      role: signupRole,
    });
  };

  const onForgotPasswordSubmit = (data: any) => {
    forgotPasswordMutation.mutate(data);
  };

  const renderLogin = () => (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl font-bold text-primary'>
          {t('auth.login')}
        </CardTitle>
        <CardDescription>{t('auth.enterCredentials')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>{t('auth.email')}</Label>
            <div className='relative'>
              <Mail
                className={`absolute top-3 h-4 w-4 text-muted-foreground ${
                  currentLanguage === 'ar' ? 'left-3' : 'right-3'
                }`}
              />
              <Input
                id='email'
                type='email'
                placeholder={t('auth.enterEmail')}
                className={currentLanguage === 'ar' ? 'pl-10' : 'pr-10'}
                {...loginForm.register('email', {
                  required: t('validation.emailRequired'),
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: t('validation.emailInvalid'),
                  },
                })}
              />
            </div>
            {loginForm.formState.errors.email && (
              <p className='text-sm text-destructive'>
                {loginForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>{t('auth.password')}</Label>
            <div className='relative'>
              <Lock
                className={`absolute top-3 h-4 w-4 text-muted-foreground ${
                  currentLanguage === 'ar' ? 'left-3' : 'right-3'
                }`}
              />
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.enterPassword')}
                className={`${
                  currentLanguage === 'ar' ? 'pl-10 pr-10' : 'pr-10 pl-10'
                }`}
                {...loginForm.register('password', {
                  required: t('validation.passwordRequired'),
                })}
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className={`absolute top-2 h-6 w-6 p-0 ${
                  currentLanguage === 'ar' ? 'right-2' : 'left-2'
                }`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
            {loginForm.formState.errors.password && (
              <p className='text-sm text-destructive'>
                {loginForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button
            type='button'
            className='w-full btn-primary'
            disabled={loginMutation.isPending}
            onClick={loginForm.handleSubmit(onLoginSubmit)}
          >
            {loginMutation.isPending ? t('auth.loggingIn') : t('auth.login')}
            {currentLanguage === 'ar' ? (
              <ArrowLeft className='mr-2 h-4 w-4' />
            ) : (
              <ArrowRight className='ml-2 h-4 w-4' />
            )}
          </Button>

          <div className='space-y-2 text-center'>
            <Button
              type='button'
              variant='link'
              className='text-sm text-primary'
              onClick={() => setCurrentView('forgot-password')}
            >
              {t('auth.forgotPassword')}؟
            </Button>

            <div className='space-y-1'>
              <p className='text-sm text-muted-foreground'>
                {t('auth.dontHaveAccount')}
              </p>
              <div className='flex flex-col gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setSignupRole('student');
                    setCurrentView('signup');
                  }}
                >
                  {t('auth.signupAsStudent')}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setSignupRole('teacher');
                    setCurrentView('signup');
                  }}
                >
                  {t('auth.signupAsTeacher')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSignup = () => (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl font-bold text-primary'>
          {signupRole === 'student'
            ? t('auth.createStudentAccount')
            : t('auth.createTeacherAccount')}
        </CardTitle>
        <CardDescription>{t('auth.enterDetailsSignup')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='firstName'>{t('auth.firstName')} *</Label>
              <div className='relative'>
                <User
                  className={`absolute top-3 h-4 w-4 text-muted-foreground ${
                    currentLanguage === 'ar' ? 'left-3' : 'right-3'
                  }`}
                />
                <Input
                  id='firstName'
                  placeholder={t('auth.enterFirstName')}
                  className={currentLanguage === 'ar' ? 'pl-10' : 'pr-10'}
                  {...signupForm.register('firstName', {
                    required: t('validation.firstNameRequired'),
                  })}
                />
              </div>
              {signupForm.formState.errors.firstName && (
                <p className='text-sm text-destructive'>
                  {signupForm.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='lastName'>{t('auth.lastName')} *</Label>
              <div className='relative'>
                <User
                  className={`absolute top-3 h-4 w-4 text-muted-foreground ${
                    currentLanguage === 'ar' ? 'left-3' : 'right-3'
                  }`}
                />
                <Input
                  id='lastName'
                  placeholder={t('auth.enterLastName')}
                  className={currentLanguage === 'ar' ? 'pl-10' : 'pr-10'}
                  {...signupForm.register('lastName', {
                    required: t('validation.lastNameRequired'),
                  })}
                />
              </div>
              {signupForm.formState.errors.lastName && (
                <p className='text-sm text-destructive'>
                  {signupForm.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>{t('auth.email')} *</Label>
            <div className='relative'>
              <Mail
                className={`absolute top-3 h-4 w-4 text-muted-foreground ${
                  currentLanguage === 'ar' ? 'left-3' : 'right-3'
                }`}
              />
              <Input
                id='email'
                type='email'
                placeholder={t('auth.enterEmail')}
                className={currentLanguage === 'ar' ? 'pl-10' : 'pr-10'}
                {...signupForm.register('email', {
                  required: t('validation.emailRequired'),
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: t('validation.emailInvalid'),
                  },
                })}
              />
            </div>
            {signupForm.formState.errors.email && (
              <p className='text-sm text-destructive'>
                {signupForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='phone'>{t('auth.phone')}</Label>
            <div className='relative'>
              <Phone
                className={`absolute top-3 h-4 w-4 text-muted-foreground ${
                  currentLanguage === 'ar' ? 'left-3' : 'right-3'
                }`}
              />
              <Input
                id='phone'
                type='tel'
                placeholder={t('auth.enterPhone')}
                className={currentLanguage === 'ar' ? 'pl-10' : 'pr-10'}
                {...signupForm.register('phone')}
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='nationalId'>{t('auth.nationalId')}</Label>
            <Input
              id='nationalId'
              placeholder={t('auth.enterNationalId')}
              {...signupForm.register('nationalId')}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>{t('auth.password')} *</Label>
            <div className='relative'>
              <Lock
                className={`absolute top-3 h-4 w-4 text-muted-foreground ${
                  currentLanguage === 'ar' ? 'left-3' : 'right-3'
                }`}
              />
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder={t('auth.enterPassword')}
                className={`${
                  currentLanguage === 'ar' ? 'pl-10 pr-10' : 'pr-10 pl-10'
                }`}
                {...signupForm.register('password', {
                  required: t('validation.passwordRequired'),
                  minLength: {
                    value: 6,
                    message: t('validation.passwordMinLength'),
                  },
                })}
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className={`absolute top-2 h-6 w-6 p-0 ${
                  currentLanguage === 'ar' ? 'right-2' : 'left-2'
                }`}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
            {signupForm.formState.errors.password && (
              <p className='text-sm text-destructive'>
                {signupForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>
              {t('auth.confirmPassword')} *
            </Label>
            <div className='relative'>
              <Lock
                className={`absolute top-3 h-4 w-4 text-muted-foreground ${
                  currentLanguage === 'ar' ? 'left-3' : 'right-3'
                }`}
              />
              <Input
                id='confirmPassword'
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t('auth.reEnterPassword')}
                className={`${
                  currentLanguage === 'ar' ? 'pl-10 pr-10' : 'pr-10 pl-10'
                }`}
                {...signupForm.register('confirmPassword', {
                  required: t('validation.confirmPasswordRequired'),
                })}
              />
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className={`absolute top-2 h-6 w-6 p-0 ${
                  currentLanguage === 'ar' ? 'right-2' : 'left-2'
                }`}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className='h-4 w-4' />
                ) : (
                  <Eye className='h-4 w-4' />
                )}
              </Button>
            </div>
            {signupForm.formState.errors.confirmPassword && (
              <p className='text-sm text-destructive'>
                {signupForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type='button'
            className='w-full btn-primary'
            disabled={signupMutation.isPending}
            onClick={signupForm.handleSubmit(onSignupSubmit)}
          >
            {signupMutation.isPending
              ? t('auth.creatingAccount')
              : t('auth.signup')}
            {currentLanguage === 'ar' ? (
              <ArrowLeft className='mr-2 h-4 w-4' />
            ) : (
              <ArrowRight className='ml-2 h-4 w-4' />
            )}
          </Button>

          <div className='text-center'>
            <Button
              type='button'
              variant='link'
              className='text-sm text-primary'
              onClick={() => setCurrentView('login')}
            >
              {t('auth.alreadyHaveAccount')} {t('auth.login')}
              {currentLanguage === 'ar' ? (
                <ArrowRight className='mr-2 h-4 w-4' />
              ) : (
                <ArrowLeft className='ml-2 h-4 w-4' />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderForgotPassword = () => (
    <Card className='w-full max-w-md mx-auto'>
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl font-bold text-primary'>
          {t('auth.forgotPassword')}
        </CardTitle>
        <CardDescription>{t('auth.enterEmailReset')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>{t('auth.email')}</Label>
            <div className='relative'>
              <Mail
                className={`absolute top-3 h-4 w-4 text-muted-foreground ${
                  currentLanguage === 'ar' ? 'left-3' : 'right-3'
                }`}
              />
              <Input
                id='email'
                type='email'
                placeholder={t('auth.enterEmail')}
                className={currentLanguage === 'ar' ? 'pl-10' : 'pr-10'}
                {...forgotPasswordForm.register('email', {
                  required: t('validation.emailRequired'),
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: t('validation.emailInvalid'),
                  },
                })}
              />
            </div>
            {forgotPasswordForm.formState.errors.email && (
              <p className='text-sm text-destructive'>
                {forgotPasswordForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <Button
            type='button'
            className='w-full btn-primary'
            disabled={forgotPasswordMutation.isPending}
            onClick={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)}
          >
            {forgotPasswordMutation.isPending
              ? t('auth.sending')
              : t('auth.sendResetLink')}
            {currentLanguage === 'ar' ? (
              <ArrowLeft className='mr-2 h-4 w-4' />
            ) : (
              <ArrowRight className='ml-2 h-4 w-4' />
            )}
          </Button>

          <div className='text-center'>
            <Button
              type='button'
              variant='link'
              className='text-sm text-primary'
              onClick={() => setCurrentView('login')}
            >
              {t('auth.backToLogin')}
              {currentLanguage === 'ar' ? (
                <ArrowRight className='mr-2 h-4 w-4' />
              ) : (
                <ArrowLeft className='ml-2 h-4 w-4' />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div
        className={`min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4 ${
          currentLanguage === 'ar' ? 'rtl' : 'ltr'
        }`}
      >
        <LanguageSwitcher />
        <div className='w-full max-w-md'>
          {currentView === 'login' && renderLogin()}
          {currentView === 'signup' && renderSignup()}
          {currentView === 'forgot-password' && renderForgotPassword()}
        </div>
      </div>
      <Toaster />
    </>
  );
};

export default Auth;
