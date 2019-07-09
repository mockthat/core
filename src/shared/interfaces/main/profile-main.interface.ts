import { IServiceShortMain } from './service-main.interface';

export interface IProfileMain {
  name: string,
  api: IServiceShortMain,
  websocket: IServiceShortMain,
  id: string;
}
