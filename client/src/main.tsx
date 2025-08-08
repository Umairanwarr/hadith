import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, checkInstallPrompt, requestNotificationPermission } from "./utils/pwa";

// قم بتفعيل خصائص PWA فقط في وضع الإنتاج لتجنب إعادة التحميلات أثناء التطوير
if (import.meta.env.PROD) {
  registerServiceWorker();
  checkInstallPrompt();
  requestNotificationPermission();
}

createRoot(document.getElementById("root")!).render(<App />);
