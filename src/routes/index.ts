import * as http from 'http';
import * as io from 'socket.io';
import * as express from 'express';

import { PathService } from '../services/path.service';
import { ServiceManagerService } from '../services/service-manager.service';

export const setRoutes = (app: express.Express, server: http.Server, path: string) => {
  const pathService = new PathService({ root: path });
  const serviceManager = new ServiceManagerService(pathService);
  const wss = io(server);

  app.get('/available-mocks', ({}, res) => {
    const mocks = pathService.getMocks().map(item => ({
      ...item,
      scenarios: pathService.getScenarios(item.id).map(scenario => {
        let running = false;
        if (serviceManager.instances[item.id] && serviceManager.instances[item.id].main.scenario.id === scenario.id) {
          running = serviceManager.instances[item.id].running;
        }

        return {
          ...scenario,
          running,
        }
      }),
      running: serviceManager.instances[item.id] ? serviceManager.instances[item.id].running : false,
    }));

    res.json(mocks);
  });

  app.get('/status', ({}, res) => {
    let instances = [];
    Object.keys(serviceManager.instances).forEach(key => {
      const instance = serviceManager.instances[key];
      instances.push({
        main: instance.main,
        running: instance.running,
      })
    });
    res.json(instances);
  });

  app.get('/mock/:categoryId/:scenarioId/start', (req, res) => {
    const instances = serviceManager.start(req.params.categoryId, req.params.scenarioId, wss);
    res.json(instances);
  });

  app.get('/mock/:categoryId/:scenarioId/stop', (req, res) => {
    serviceManager.stop(req.params.categoryId);
    res.json({
      action: 'stop',
    });
  });
};
