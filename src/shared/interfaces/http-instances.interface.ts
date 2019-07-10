import { IScenarioMain } from './main/scenario-main.interface';
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
    scenario: IScenarioMain;
    category: ICategoryMain;
    api?: IApiMain;
    websocket?: IWebsocketMain;
  },
  server?: HttpManagerService;
  socket?: WebsocketManagerService;
}
