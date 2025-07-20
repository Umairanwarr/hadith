import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, checkInstallPrompt, requestNotificationPermission } from "./utils/pwa";

// تسجيل Service Worker
registerServiceWorker();

// التحقق من إمكانية التثبيت
checkInstallPrompt();

// طلب إذن الإشعارات
requestNotificationPermission();

createRoot(document.getElementById("root")!).render(<App />);
