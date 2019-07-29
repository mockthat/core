import * as fs from "fs";
import * as path from "path";
import * as Mustache from "mustache";

export function getMustacheResponse(destinationPath, service) {
  let partials = {};
  let scenario;
  let response;

  try {
    scenario = JSON.parse(fs.readFileSync(path.resolve(`${destinationPath}/${service.path}`), 'utf-8'));
  } catch (e) {
    console.log(scenario);
    response = 'Error in scenario definition';
  }

  if (scenario) {
    const template = fs.readFileSync(path.resolve(`${destinationPath}/../../../templates/${scenario.template}.mustache`), 'utf-8');
    const partialsKeys = (template.match(/{{>(.*?)}}/g) || []).map(partial => partial.replace(/({{>)?(}})?/g, ''));

    if (partialsKeys) {
      partialsKeys.forEach(
        partial =>
          partials[partial] = fs.readFileSync(path.resolve(`${destinationPath}/../../../templates/${partial}.mustache`), 'utf-8')
      )
    }

    response = Mustache.render(template, scenario.data, partials).replace(/,(?=\s*[}\]])/mig,'');

    try {
      response = JSON.stringify(JSON.parse(response));
    } catch (e) {
      console.log(response);
      console.log(e);
      response = 'Error in response template';
    }
  }

  return response;
}
