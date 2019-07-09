import * as express from 'express';
import * as path from 'path';
import * as io from 'socket.io';
import * as http from 'http';
import { PathService } from './services/path.service';
import { ServiceManagerService } from './services/service-manager.service';

const PATH_MODULES = path.resolve('./modules');

const pathService = new PathService({
  root: PATH_MODULES,
});

const httpManager = new ServiceManagerService(pathService);

const PORT = process.env.PORT || 7000;
const app = express();

const server = http.createServer(app);

//initialize the WebSocket server instance
const wss = io(server);

app.get('/', ({}, res) => {
  res.send('Hello World 2');
});

app.get('/modules', ({}, res) => {
  res.json(pathService.getModules());
});

app.get('/modules/:moduleId', (req, res) => {
  res.json(pathService.getProfiles(req.params.moduleId));
});

app.get('/modules/:moduleId/:profileId', (req, res) => {
  res.json(req.params);
});

app.get('/modules/:moduleId/:profileId/start', (req, res) => {
  const instances = httpManager.start(req.params.moduleId, req.params.profileId, wss);
  res.json(instances);
});

app.get('/modules/:moduleId/:profileId/stop', (req, res) => {
  httpManager.stop(req.params.moduleId);
  res.json({
    param: req.params,
    action: 'stop',
  });
});

server.listen(PORT, () => {
  console.log(`Server is running in http://localhost:${PORT}`);
});
