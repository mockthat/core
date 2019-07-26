import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { IApiMain } from '../shared/interfaces/main/service-main.interface';
import { datify } from '../utils/datify';
import * as Mustache from 'mustache'

let servers: {
  [port: string]: {
    express: express.Express,
    server: any;
  }
} = {};

export class HttpManagerService {
  express: express.Express;
  server: any;

  constructor(public config: IApiMain, public path: string) {
    if (servers[config.port]) {
      console.log('Server already started into giver door, using it');
      this.express = servers[config.port].express;
      this.server = servers[config.port].server;
    } else {
      this.express = express();

      this.server = this.express.listen(config.port, () => {
        console.log(`All routes started on port ${config.port}`);
      });

      this.express.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
      });

      this.express.get('/', ({} , res) => res.json({ running: true }));


      servers[config.port] = {
        express: this.express,
        server: this.server,
      };
    }

    this.initializeRoute();
  }

  private initializeRoute() {
    const app = this.express;

    this.config.services.forEach(service => {
      let response: any;

      if (service.mustache) {
        let partials = {};
        let scenario;

        try {
          scenario = JSON.parse(fs.readFileSync(path.resolve(`${this.path}/${service.path}`), 'utf-8'));
        } catch (e) {
          response = 'Error in scenario definition';
        }

        if (scenario) {
          const template = fs.readFileSync(path.resolve(`${this.path}/../../../templates/${scenario.template}.mustache`), 'utf-8');
          const partialsKeys = template.match(/{{>(.*?)}}/g).map(partial => partial.replace(/({{>)?(}})?/g, ''));

          if (partialsKeys) {
            partialsKeys.forEach(
              partial =>
                partials[partial] = fs.readFileSync(path.resolve(`${this.path}/../../../templates/${partial}.mustache`), 'utf-8')
            )
          }

          response = Mustache.render(template, scenario.data, partials);

          try {
            response = JSON.stringify(JSON.parse(response));
          } catch (e) {
            response = 'Error in response template';
          }
        }
      } else {
        if (service.path) {
          response = fs.readFileSync(path.resolve(`${this.path}/${service.path}`), 'utf-8');
        }
      }

      if (service.path && service.datify) {
        response = datify(response);
      }

      console.log(`\tAdding route [${service.method}] ${service.api}`);

      app[service.method.toLocaleLowerCase()](service.api, ({}, res: express.Response) => {

        if (service.header) {
          Object.keys(service.header).forEach((v: string) => res.setHeader(v, service.header[v]));
        }

        res.statusCode = service.code || 200;

        let jsonResponse;

        try {
          jsonResponse = JSON.parse(response);
        } catch(e) {
          jsonResponse = 'Error in response template';
        }

        setTimeout(() => res.json(jsonResponse), service.delay || 0);
      });
    });
  }

  stop() {
    if (!this.server && !servers[this.config.port]) {
      throw new Error('Server not started!');
    }
    console.log(`Stopping server on pot ${this.config.port}`);
    this.server.close();
    delete servers[this.config.port];
  }
}
