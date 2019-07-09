import { IProfileMain } from './main/profile-main.interface';
import { IApiMain, IWebsocketMain } from './main/service-main.interface';
import { HttpManagerService } from '../../services/http-manager.service';
import { WebsocketManagerService } from '../../services/websocket-manager.service';
import { ICategoryMain } from './main/category-main.interface';

export interface IHttpInstances {
  [categoryId: string]: IHttpInstance;
}

export interface IHttpInstance {
  running: boolean;
  main: {
    profile: IProfileMain;
    category: ICategoryMain;
    api?: IApiMain;
    websocket?: IWebsocketMain;
  },
  server?: HttpManagerService;
  socket?: WebsocketManagerService;
}
