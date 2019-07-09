import { IProfileMain } from './main/profile-main.interface';
import { IApiMain, IWebsocketMain } from './main/service-main.interface';
import { HttpManagerService } from '../../services/http-manager.service';
import { WebsocketManagerService } from '../../services/websocket-manager.service';

export interface IHttpInstances {
  [moduleId: string]: IHttpInstance;
}

export interface IHttpInstance {
  running: boolean;
  main: {
    profile: IProfileMain;
    api?: IApiMain;
    websocket?: IWebsocketMain;
  },
  server?: HttpManagerService;
  socket?: WebsocketManagerService;
}
