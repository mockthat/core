import { IWebsocketMain } from '../shared/interfaces/main/service-main.interface';
import * as path from 'path';
import * as fs from 'fs';
import * as io from 'socket.io';

export class WebsocketManagerService {
  active = true;

  constructor(private config: IWebsocketMain, private path: string, io: io.Server) {
    this.init(io);

    io.on('disconnection', (connection) => {
      console.log('\tClient connected!');
      this.startLooping(0, connection);
    });
  }

  init(io: io.Server) {
    switch(this.config.trigger) {
      case 'IMMEDIATELY':
        this.startLooping(0, io);
        break;
      case 'ON_CONNECTION':
        io.on('connection', socket => {
          console.log('\tClient connected!');
          this.startLooping(0, socket);

          socket.on('disconnect', () => {
            console.log('\tClient disconnected!');
            this.stop();
         });
        });
        break;
    }
  }

  startLooping(messageIndex: number, io: io.Socket | io.Server) {
    const message = this.config.messages[messageIndex];

    if (!message && this.config.repeat && this.active) {
      this.startLooping(0, io);
    }

    if (!message) {
      return;
    }

    const content = fs.readFileSync(path.resolve(`${this.path}/${message.path}`), 'utf-8');

    const nextIndex = messageIndex + 1;

    setTimeout(() => {
      if (!this.active) {
        return;
      }

      this.startLooping(nextIndex, io);
      console.log(`Emiting ${message.event}`);
      io.emit(message.event, JSON.parse(content));
    }, message.delay || 0);
  }

  stop() {
    this.active = false;
  }
}
