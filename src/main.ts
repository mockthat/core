import * as express from 'express';
import * as http from 'http';
import { resolve } from 'path';
import { setRoutes } from './routes/index';

export const initialize = (path: string, port: number) => {
  const PORT = port || 7000;
  const app = express();
  const server = http.createServer(app);

  setRoutes(app, server, path);

  server.listen(PORT, () => {
    console.log(`Mock that! is currently runnig at http://localhost:${PORT}/`);
    console.log(`Serving Files: ${resolve(`${path}`)}`);
  });

  return app;
}
