import * as http from 'http';
import * as io from 'socket.io';

import { PathService } from '../services/path.service';
import { ServiceManagerService } from '../services/service-manager.service';


export const setRoutes = (app: any, server: http.Server, path: string) => {

  const pathService = new PathService({
    root: path,
  });

  const httpManager = new ServiceManagerService(pathService);

  //initialize the WebSocket server instance
  const wss = io(server);

  app.get('/', ({}, res) => {
    res.send('Soon will have some documentation here');
  });

  app.get('/mocks', ({}, res) => {
    res.json(pathService.getMocks());
  });

  app.get('/mocks/:categoryId', (req, res) => {
    res.json(pathService.getProfiles(req.params.categoryId));
  });

  app.get('/mocks/:categoryId/:profileId', (req, res) => {
    res.json(req.params);
  });

  app.get('/mocks/:categoryId/:profileId/start', (req, res) => {
    const instances = httpManager.start(req.params.categoryId, req.params.profileId, wss);
    res.json(instances);
  });

  app.get('/mocks/:categoryId/:profileId/stop', (req, res) => {
    httpManager.stop(req.params.categoryId);
    res.json({
      param: req.params,
      action: 'stop',
    });
  });
};
