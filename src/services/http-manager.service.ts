import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { IApiMain } from '../shared/interfaces/main/service-main.interface';
import { datify } from '../utils/datify';
import { getMustacheResponse } from "../utils/mustache";

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

  static registerServer(port: string, express: express.Express, server: any) {
    servers[port] = { express, server };
  }

  private initializeRoute() {
    const app = this.express;

    this.config.services.forEach(service => {
      let response: any;

      if (service.mustache) {
        response = getMustacheResponse(this.path, service);
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

        setTimeout(() => {
          try {
            res.json(JSON.parse(response));
          } catch(e) {
            console.log(e);
          }
        }, service.delay || 0);
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
