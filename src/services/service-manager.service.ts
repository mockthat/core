import { IHttpInstances, IHttpInstance } from "../shared/interfaces/http-instances.interface";
import { PathService } from "./path.service";
import { IWebsocketMain, IApiMain } from "../shared/interfaces/main/service-main.interface";
import { HttpManagerService } from "./http-manager.service";
import { WebsocketManagerService } from "./websocket-manager.service";
import * as io from 'socket.io';

export class ServiceManagerService {
  instances: IHttpInstances = {};

  constructor(private pathService: PathService) {}

  private load(categoryId: string, profileId: string): IHttpInstance {
    const category = this.pathService.getCategory(categoryId);
    const profile = this.pathService.getProfile(categoryId, profileId);
    let websocket: IWebsocketMain;
    let api: IApiMain;
    if (profile.websocket.active) {
      websocket = this.pathService.getService<IWebsocketMain>(categoryId, profileId, 'websocket');
    }

    if (profile.api.active) {
      api = this.pathService.getService<IApiMain>(categoryId, profileId, 'api');
    }

    return {
      running: false,
      main: { api, profile, websocket, category }
    }
  }

  start(categoryId: string, profileId: string, socketServer: io.Server) {
    if (this.instances[categoryId] && this.instances[categoryId].running) {
      console.log('stopping already started server');
      this.stop(categoryId);
      delete this.instances[categoryId];
    }

    const config = this.load(categoryId, profileId);

    if (config.main.api) {
      config.server = new HttpManagerService(
        config.main.api,
        this.pathService.getServicePath(categoryId, profileId, 'api'),
      );
    }

    if (config.main.websocket) {
      config.socket = new WebsocketManagerService(
        config.main.websocket,
        this.pathService.getServicePath(categoryId, profileId, 'websocket'),
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
      config.server.stop();
    }

    if (config.socket) {
      config.socket.stop();
    }

    config.running = false;
  }
}
