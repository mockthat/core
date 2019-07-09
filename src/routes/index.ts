import * as http from 'http';
import * as io from 'socket.io';

import { PathService } from '../services/path.service';
import { ServiceManagerService } from '../services/service-manager.service';


export const setRoutes = (app: any, server: http.Server, path: string) => {
  const PATH_MODULES = path;

  const pathService = new PathService({
    root: PATH_MODULES,
  });

  const httpManager = new ServiceManagerService(pathService);

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
};
