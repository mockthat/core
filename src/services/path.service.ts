import * as path from 'path';
import * as fs from 'fs';
import { IPathConfig } from '../shared/interfaces/path.interface';
import { IProfileMain } from '../shared/interfaces/main/profile-main.interface';

export class PathService {
  constructor(private config: IPathConfig) { }

  getModules() {
    return this.readMainJSON(this.config.root);
  }

  getProfiles(moduleId: string) {
    const modulePath = path.resolve(`${this.config.root}/${moduleId}/profile`);

    if (!fs.existsSync(modulePath)) {
      throw new Error(`${modulePath} doesn't exist!`);
    }


    return this.readMainJSON(modulePath, `${this.config.root}/${moduleId}/profile`);
  }

  getProfile(moduleId: string, profileId: string): IProfileMain {
    const profilePath = path.resolve(`${this.config.root}/${moduleId}/profile/${profileId}/main.json`);

    if (!fs.existsSync(profilePath)) {
      throw new Error(`${profilePath} doesn't exist!`);
    }

    return { ...JSON.parse(fs.readFileSync(profilePath, 'utf-8')), id: profileId };
  }

  getService<T>(moduleId: string, profileId: string, servicePath: 'api' | 'websocket'): T {
    const profilePath = path.resolve(`${this.getServicePath(moduleId, profileId, servicePath)}/main.json`);

    if (!fs.existsSync(profilePath)) {
      throw new Error(`${profilePath} doesn't exist!`);
    }

    return JSON.parse(fs.readFileSync(profilePath, 'utf-8'));
  }

  getServicePath(moduleId: string, profileId: string, servicePath: 'api' | 'websocket') {
    return path.resolve(`${this.config.root}/${moduleId}/profile/${profileId}/${servicePath}/`);
  }

  readMainJSON(initialPath: string, mainPathPrefix: string = initialPath): any {
    return fs.readdirSync(initialPath)
      // tranform to full path
      .map(profileFolder => ({
        path: path.resolve(`${mainPathPrefix}/${profileFolder}/main.json`),
        id: profileFolder,
      }))
      .map(({ id, path }) => {
        if (!fs.existsSync(path)) {
          throw new Error(`${path} doesn't exist!`);
        }

        try {
          return {
            ...JSON.parse(fs.readFileSync(path, 'utf-8')),
            id,
          };
        } catch (e) {
          throw new Error(`Invalid JSON!`);
        }
      })
  }
}
