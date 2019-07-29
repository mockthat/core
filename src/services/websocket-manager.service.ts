import { IWebsocketMain } from '../shared/interfaces/main/service-main.interface';
import * as path from 'path';
import * as fs from 'fs';
import * as io from 'socket.io';
import { datify } from "../utils/datify";
import { getMustacheResponse } from "../utils/mustache";

export class WebsocketManagerService {
  active = true;
  io: io.Server;

  constructor(private config: IWebsocketMain, private path: string, io: io.Server) {
    this.init(io);
    this.io = io;

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
         });
        });
        break;
    }
  }

  startLooping(messageIndex: number, io: io.Socket | io.Server) {
    if (!this.active) {
      return;
    }

    const message = this.config.messages[messageIndex];
    let content;

    if (!message && this.config.repeat && this.active) {
      this.startLooping(0, io);
    }

    if (!message) {
      return;
    }

    if (this.config.mustache) {
      content = getMustacheResponse(this.path, message);
    } else {
      if (message.path) {
        content = fs.readFileSync(path.resolve(`${this.path}/${message.path}`), 'utf-8');
      }
    }

    if (this.config.datify) {
      content = datify(content);
    }

    const nextIndex = messageIndex + 1;

    setTimeout(() => {
      if (!this.active) {
        return;
      }

      this.startLooping(nextIndex, io);
      console.log(`Emiting ${message.event}`);
      io.emit(message.event, this.config.asString ? content : JSON.parse(content));
    }, message.delay || 0);
  }

  stop() {
    this.active = false;
  }
}
