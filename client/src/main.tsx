import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, checkInstallPrompt, requestNotificationPermission } from "./utils/pwa";
import { isBrowserTranslating, preventTranslationRefresh, preventDropdownTranslationRefresh } from "./utils/dom-safety";

// Global error handler for browser translation conflicts
window.addEventListener('error', (event) => {
  const isTranslationError = 
    event.message?.includes('removeChild') ||
    event.message?.includes('The node to be removed is not a child') ||
    event.message?.includes('runtime-error-plugin') ||
    event.filename?.includes('runtime-error-plugin');

  if (isTranslationError && isBrowserTranslating()) {
    console.warn('Browser translation DOM conflict detected and suppressed:', event.message);
    event.preventDefault();
    event.stopPropagation();
    return false;
  }
});

// Handle unhandled promise rejections that might be translation-related
window.addEventListener('unhandledrejection', (event) => {
  const isTranslationError = 
    event.reason?.message?.includes('removeChild') ||
    event.reason?.message?.includes('The node to be removed is not a child') ||
    event.reason?.message?.includes('runtime-error-plugin');

  if (isTranslationError && isBrowserTranslating()) {
    console.warn('Browser translation promise rejection detected and suppressed:', event.reason);
    event.preventDefault();
  }
});

// Setup translation refresh prevention
preventTranslationRefresh();
preventDropdownTranslationRefresh();

// قم بتفعيل خصائص PWA فقط في وضع الإنتاج لتجنب إعادة التحميلات أثناء التطوير
if (import.meta.env.PROD) {
  registerServiceWorker();
  checkInstallPrompt();
  requestNotificationPermission();
}

createRoot(document.getElementById("root")!).render(<App />);
