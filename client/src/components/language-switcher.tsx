import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import { useTranslation } from '../hooks/use-translation';

export const LanguageSwitcher = () => {
  const { currentLanguage, changeLanguage } = useTranslation();

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
    changeLanguage(newLanguage);
  };

  return (
    <Button
      variant='outline'
      size='sm'
      onClick={toggleLanguage}
      className='flex items-center gap-2'
    >
      <Globe className='h-4 w-4' />
      {currentLanguage === 'ar' ? 'EN' : 'ع'}
    </Button>
  );
};
