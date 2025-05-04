import 'zone.js/node';
import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { existsSync } from 'fs';
import { join } from 'path';
import bootstrap from './src/main.server';

export function app(): express.Express {
  const server = express();
  const distFolder = join(process.cwd(), 'dist/furia-chat-bot-front/browser');
  const indexHtml = existsSync(join(distFolder, 'index.original.html'))
    ? 'index.original.html'
    : 'index.html';

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', distFolder);

  // Servir arquivos estáticos
  server.get('*.*', express.static(distFolder, { maxAge: '1y' }));

  // SSR para rotas dinâmicas
  server.get('*', (req, res, next) => {
    commonEngine.render({
      bootstrap,
      documentFilePath: join(distFolder, indexHtml),
      url: req.url,
      providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }],
    }).then((html) => res.send(html)).catch((err) => next(err));
  });

  return server;
}

// Para deploy no Vercel (compatível com ESM)
export default app();

// Ou, se precisar de compatibilidade com testes locais:
if (import.meta.url.endsWith(process.argv[1])) {
  app().listen(process.env['PORT'] || 4000, () => {
    console.log(`Server running on http://localhost:${process.env['PORT'] || 4000}`);
  });
}