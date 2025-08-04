// Format functions for different data types
export const formatDate = (date, language = 'ar') => {
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat(
    language === 'ar' ? 'ar-SA' : 'en-US',
    options
  ).format(date);
};

export const formatNumber = (number, language = 'ar') => {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US').format(
    number
  );
};

export const formatCurrency = (amount, currency = 'SAR', language = 'ar') => {
  return new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Direction utilities
export const getTextDirection = (language) => {
  return language === 'ar' ? 'rtl' : 'ltr';
};

export const getIconPosition = (language, position = 'left') => {
  if (language === 'ar') {
    return position === 'left' ? 'right' : 'left';
  }
  return position;
};
