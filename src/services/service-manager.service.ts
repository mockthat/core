import { IHttpInstances, IHttpInstance } from "../shared/interfaces/http-instances.interface";
import { PathService } from "./path.service";
import { IWebsocketMain, IApiMain } from "../shared/interfaces/main/service-main.interface";
import { HttpManagerService } from "./http-manager.service";
import { WebsocketManagerService } from "./websocket-manager.service";
import * as io from 'socket.io';
import * as path from "path";
import watch from "node-watch";

export class ServiceManagerService {
  instances: IHttpInstances = {};

  constructor(private pathService: PathService) {
    watch(path.resolve(`${this.pathService.getRootPath()}`), { recursive: true }, () => {
      console.log(`Files changed - let's rebuild your endpoints!`);

      for (const instance in this.instances) {
        this.start(
          this.instances[instance].main.category.id,
          this.instances[instance].main.scenario.id,
          this.instances[instance].socket ? this.instances[instance].socket.io : null
        );
      }
    });
  }

  private load(categoryId: string, scenarioId: string): IHttpInstance {
    const category = this.pathService.getCategory(categoryId);
    const scenario = this.pathService.getScenario(categoryId, scenarioId);
    let websocket: IWebsocketMain;
    let api: IApiMain;
    if (scenario.websocket.active) {
      websocket = this.pathService.getService<IWebsocketMain>(categoryId, scenarioId, 'websocket');
    }

    if (scenario.api.active) {
      api = this.pathService.getService<IApiMain>(categoryId, scenarioId, 'api');
    }

    return {
      running: false,
      main: { api, scenario, websocket, category }
    }
  }

  start(categoryId: string, scenarioId: string, socketServer: io.Server) {
    if (this.instances[categoryId] && this.instances[categoryId].running) {
      this.stop(categoryId);
      delete this.instances[categoryId];
    }

    const config = this.load(categoryId, scenarioId);

    if (config.main.api) {
      config.server = new HttpManagerService(
        config.main.api,
        this.pathService.getServicePath(categoryId, scenarioId, 'api'),
      );
    }

    if (config.main.websocket) {
      config.socket = new WebsocketManagerService(
        config.main.websocket,
        this.pathService.getServicePath(categoryId, scenarioId, 'websocket'),
        socketServer,
      );
    }

    config.running = true;
    this.instances[categoryId] = config;

    return {
      main: config.main,
      running: config.running,
    };
  }

  stop(categoryId: string) {
    const config = this.instances[categoryId];
    if (
      !config ||
      !config.running ||
      (!config.server && !config.socket)) {
      throw new Error(`Server is not started for ${categoryId}`);
    }

    if (config.server) {
      console.log('Stopping already started server');
      config.server.stop();
    }

    if (config.socket) {
      console.log('Stopping already started websocket');
      config.socket.stop();
    }

    config.running = false;
  }
}
