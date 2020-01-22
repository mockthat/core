/**
 * Datify source
 * Possible bindings:
 * {{PARAM(matchId)}} - get parameter for matchId
 *
 * @param source
 * @param params
 */

function escapeRegExp(string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function paramify(source, params) {
  const paramBindings = source.match(/@@PARAM\((.*?)\)@@|\"@@PARAM\((.*?)\)@@\"/g);
  let output = source;

  if (paramBindings) {
    paramBindings.forEach(binding => {
      const param = binding.replace(/(\"@@PARAM\()?(\)@@\")?|(@@PARAM\()?(\)@@)?/g, '');

      try {
        if (param) {
          output = output.replace(new RegExp(escapeRegExp(binding), "g"), params[param]);
        }
      } catch (e) {
        console.log(e);
      }
    });
  }

  return output;
}
