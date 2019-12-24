import * as http from 'http';
import * as io from 'socket.io';
import * as express from 'express';

import { PathService } from '../services/path.service';
import { ServiceManagerService } from '../services/service-manager.service';
import { HttpManagerService } from '../services/http-manager.service';

export const setRoutes = (app: express.Express, server: http.Server, path: string) => {
  const pathService = new PathService({ root: `${path}/mock`, setsRoot: `${path}/sets` });
  const serviceManager = new ServiceManagerService(pathService);

  if (process.env.PORT) {
    HttpManagerService.registerServer(process.env.PORT, app, server);
  }

  const wss = io(server);
  let activatedSet = '';

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

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

  app.get('/available-sets', ({}, res) => {
    const sets = pathService.getSets();

    res.json(sets);
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

  app.get('/set/status', ({}, res) => {
    res.json({ active: activatedSet });
  });

  app.post('/set/:setId/start', (req, res) => {
    const setData = pathService.getScenariosFromSet(req.params.setId);

    activatedSet = req.params.setId;
    serviceManager.stopAll();
    setData.activated.forEach(activatedRoute => {
      serviceManager.start(activatedRoute.type, activatedRoute.option, wss);
    });
    res.json(setData.activated);
  });

  app.post('/mock/:categoryId/:scenarioId/start', (req, res) => {
    const instances = serviceManager.start(req.params.categoryId, req.params.scenarioId, wss);
    res.json(instances);
  });

  app.post('/mock/:categoryId/:scenarioId/stop', (req, res) => {
    serviceManager.stop(req.params.categoryId);
    res.json({
      action: 'stop',
    });
  });
};
