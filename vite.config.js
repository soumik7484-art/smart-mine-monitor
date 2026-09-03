import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';

const portalRoot = path.resolve(process.cwd(), 'authentication-admin');

function adminPortalStatic() {
  return {
    name: 'admin-portal-static',
    configureServer(server) {
      server.middlewares.use('/authentication-admin', (request, response, next) => {
        const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
        const filePath = path.resolve(portalRoot, `.${requestPath}`);

        if (!filePath.startsWith(portalRoot) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          next();
          return;
        }

        const contentTypes = {
          '.css': 'text/css',
          '.html': 'text/html',
          '.js': 'text/javascript',
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.svg': 'image/svg+xml',
        };
        response.setHeader('Content-Type', contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream');
        fs.createReadStream(filePath).pipe(response);
      });
    },
    generateBundle() {
      const emitPortalFiles = (directory) => {
        for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
          const entryPath = path.join(directory, entry.name);
          if (entry.isDirectory()) {
            emitPortalFiles(entryPath);
          } else {
            this.emitFile({
              type: 'asset',
              fileName: path.join('authentication-admin', path.relative(portalRoot, entryPath)).replaceAll(path.sep, '/'),
              source: fs.readFileSync(entryPath),
            });
          }
        }
      };
      emitPortalFiles(portalRoot);
    },
  };
}

export default defineConfig({
  plugins: [react(), adminPortalStatic()],
  base: './',
  server: {
    port: 3000,
    open: true,
  },
});
