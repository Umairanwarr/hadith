import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Only setup vite in development
  if (process.env.NODE_ENV !== 'development') {
    console.warn("Vite not available in production, skipping setup");
    return;
  }

  try {
    // Dynamic import to avoid bundling issues
    const { createServer } = await import("vite");
    const viteConfig = (await import("../vite.config")).default;
    
    const vite = await createServer({
      ...viteConfig,
      configFile: false,
      server: {
        middlewareMode: true,
        hmr: { server },
        allowedHosts: true,
      },
      appType: "custom",
    });

    app.use(vite.middlewares);
    
    // Handle SPA routing in development
    app.use("*", async (req: any, res: any, next: any) => {
      const url = req.originalUrl;
      
      try {
        const clientTemplate = path.resolve(
          import.meta.dirname,
          "..",
          "client",
          "index.html",
        );

        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        next(e);
      }
    });
  } catch (e) {
    console.warn("Failed to setup Vite:", e);
  }
}

export function serveStatic(app: Express) {
  // In production, serve from the client/dist directory
  const distPath = path.resolve(import.meta.dirname, "..", "client", "dist");

  if (!fs.existsSync(distPath)) {
    console.warn(`Build directory not found: ${distPath}`);
    return;
  }

  // Serve static files
  app.use(express.static(distPath));

  // SPA fallback - serve index.html for all routes
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
