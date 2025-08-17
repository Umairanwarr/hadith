import express, { type Request, Response, NextFunction } from 'express';
import { registerRoutes } from './routes';
import dotenv from 'dotenv';
import cors from 'cors';
import { specs, swaggerUi } from './swagger';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow mobile/curl

    const allowedOrigins = [
      'http://localhost:3001',
      'http://127.0.0.1:3001',
      'http://localhost:5000',
      'http://127.0.0.1:5000',
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://hadith-learning.netlify.app',
    ];

    if (origin.includes('.vercel.app') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
})
);

// simple logger for production
const log = (...args: any[]) => console.log(...args);

// request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + '…';
      log(logLine);
    }
  });

  next();
});

(async () => {
  // Swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

  const server = await registerRoutes(app);

  // global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
    console.error(err);
  });

  // only load vite helpers dynamically in dev
  if (process.env.NODE_ENV === 'development') {
    try {
      const { setupVite } = await import('./vite');
      await setupVite(app, server);
    } catch (e) {
      console.warn('Failed to setup Vite:', e);
    }
  } else {
    // In production, serve static files directly
    const fs = await import('fs');
    const path = await import('path');

    const distPath = path.resolve(__dirname, '..', 'dist');

    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      // SPA fallback
      app.use('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    } else {
      console.warn(`Build directory not found: ${distPath}`);
    }
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(
    { port, host: '0.0.0.0' },
    () => {
      log(`Server running on port ${port}`);
      log(`Access your app at: http://localhost:${port}`);
      log(`Or at: http://127.0.0.1:${port}`);
    }
  );
})();
