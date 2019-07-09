import { IHttpInstances, IHttpInstance } from "../shared/interfaces/http-instances.interface";
import { PathService } from "./path.service";
import { IWebsocketMain, IApiMain } from "../shared/interfaces/main/service-main.interface";
import { HttpManagerService } from "./http-manager.service";
import { WebsocketManagerService } from "./websocket-manager.service";
import * as io from 'socket.io';

export class ServiceManagerService {
  instances: IHttpInstances = {};

  constructor(private pathService: PathService) {}

  private load(moduleId: string, profileId: string): IHttpInstance {
    const profile = this.pathService.getProfile(moduleId, profileId);
    let websocket: IWebsocketMain;
    let api: IApiMain;
    if (profile.websocket.active) {
      websocket = this.pathService.getService<IWebsocketMain>(moduleId, profileId, 'websocket');
    }

    if (profile.api.active) {
      api = this.pathService.getService<IApiMain>(moduleId, profileId, 'api');
    }

    return {
      running: false,
      main: { api, profile, websocket }
    }
  }

  start(moduleId: string, profileId: string, socketServer: io.Server) {
    if (this.instances[moduleId] && this.instances[moduleId].running) {
      console.log('stopping already started server');
      this.stop(moduleId);
      delete this.instances[moduleId];
    }

    const config = this.load(moduleId, profileId);

    if (config.main.api) {
      config.server = new HttpManagerService(
        config.main.api,
        this.pathService.getServicePath(moduleId, profileId, 'api'),
      );
    }

    if (config.main.websocket) {
      config.socket = new WebsocketManagerService(
        config.main.websocket,
        this.pathService.getServicePath(moduleId, profileId, 'websocket'),
        socketServer,
      );
    }

    config.running = true;
    this.instances[moduleId] = config;

    return {
      main: config.main,
      running: config.running,
    };
  }

  stop(moduleId: string) {
    const config = this.instances[moduleId];
    if (
      !config ||
      !config.running ||
      (!config.server && !config.socket)) {
      throw new Error(`Server is not started for ${moduleId}`);
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
