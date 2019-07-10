import { IServiceShortMain } from './service-main.interface';

export interface IScenarioMain {
  name: string,
  api: IServiceShortMain,
  websocket: IServiceShortMain,
  id: string;
}
