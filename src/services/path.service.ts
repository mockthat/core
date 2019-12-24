import * as path from 'path';
import * as fs from 'fs';
import { IPathConfig } from '../shared/interfaces/path.interface';
import { IScenarioMain } from '../shared/interfaces/main/scenario-main.interface';
import { ICategoryMain } from '../shared/interfaces/main/category-main.interface';

export class PathService {
  constructor(private config: IPathConfig) { }

  getRootPath() {
    return this.config.root;
  }

  getMocks(): ICategoryMain[] {
    return this.readMainJSON(this.config.root);
  }

  getCategory(categoryId: string): IScenarioMain {
    const categoryPath = path.resolve(`${this.config.root}/${categoryId}/main.json`);

    if (!fs.existsSync(categoryPath)) {
      throw new Error(`${categoryPath} doesn't exist!`);
    }

    return { ...JSON.parse(fs.readFileSync(categoryPath, 'utf-8')), id: categoryId };
  }

  getSets(): any[] {
    return fs.readdirSync(path.resolve(this.config.setsRoot))
      .map((set) => {
        try {
          return {
            filename: set.replace('.json', ''),
            name: JSON.parse(fs.readFileSync(path.resolve(`${this.config.setsRoot}/${set}`), 'utf-8')).name,
          };
        } catch (e) {
          throw new Error(`Error in set directory`);
        }
      })
  }

  getScenariosFromSet(set: string) {
    return JSON.parse(fs.readFileSync(path.resolve(`${this.config.setsRoot}/${set}.json`), 'utf-8'));
  }

  getScenarios(categoryId: string): IScenarioMain[] {
    const modulePath = path.resolve(`${this.config.root}/${categoryId}/scenarios`);

    if (!fs.existsSync(modulePath)) {
      throw new Error(`${modulePath} doesn't exist!`);
    }


    return this.readMainJSON(modulePath, `${this.config.root}/${categoryId}/scenarios`);
  }

  getScenario(categoryId: string, scenarioId: string): IScenarioMain {
    const scenarioPath = path.resolve(`${this.config.root}/${categoryId}/scenarios/${scenarioId}/main.json`);

    if (!fs.existsSync(scenarioPath)) {
      throw new Error(`${scenarioPath} doesn't exist!`);
    }

    return { ...JSON.parse(fs.readFileSync(scenarioPath, 'utf-8')), id: scenarioId };
  }

  getService<T>(categoryId: string, scenarioId: string, servicePath: 'api' | 'websocket'): T {
    const scenarioPath = path.resolve(`${this.getServicePath(categoryId, scenarioId, servicePath)}/main.json`);

    if (!fs.existsSync(scenarioPath)) {
      throw new Error(`${scenarioPath} doesn't exist!`);
    }

    return JSON.parse(fs.readFileSync(scenarioPath, 'utf-8'));
  }

  getServicePath(categoryId: string, scenarioId: string, servicePath: 'api' | 'websocket') {
    return path.resolve(`${this.config.root}/${categoryId}/scenarios/${scenarioId}/${servicePath}/`);
  }

  readMainJSON(initialPath: string, mainPathPrefix: string = initialPath): any {
    return fs.readdirSync(initialPath)
      // tranform to full path
      .map(scenarioFolder => ({
        path: path.resolve(`${mainPathPrefix}/${scenarioFolder}/main.json`),
        id: scenarioFolder,
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
