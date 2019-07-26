export interface IServiceShortMain {
  active: boolean,
}

export interface IService {
  api: string,
  method: 'POST' | 'PUT' | 'GET' | 'DELETE',
  path: string,
  code: number,
  delay?: number,
  datify?: boolean,
  header: any,
  mustache?: boolean
}

export interface IMessage {
  event: string,
  path: string,
  delay?: number
}

export interface IApiMain {
  services: IService[];
  port: number;
}

export interface IWebsocketMain {
  messages: IMessage[],
  trigger: 'ON_CONNECTION' | 'IMMEDIATELY';
  repeat: boolean;
  datify?: boolean;
  asString?: boolean;
}

