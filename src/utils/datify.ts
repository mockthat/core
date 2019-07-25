/**
 * Datify source
 * Possible bindings:
 * {{DATE(NOW)}} - actual date
 * {{DATE('13-05-2019')}} - date to parse
 * {{DATE('13-05-2019', 0, 'dd-mm-yyyy')}} - date to parse with custom outputFormat
 * {{DATE(NOW, 500)}} - actual date plus 500ms
 * {{DATE('13-05-2019', 500)}} - selected date plus 500ms
 *
 * @param source
 * @param outputFormat
 */

import * as moment from 'moment';

function escapeRegExp(string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function datify(source, outputFormat = null) {
  const dateBindings = source.match(/{{DATE\((.*?)\)}}/g);
  const nowSource = moment();
  let output = source;

  if (dateBindings) {
    dateBindings.forEach(binding => {
      let now = nowSource.clone();
      const args = binding.replace(/({{DATE\()?(\)}})?/g, '').split(',');

      try {
        switch (args.length) {
          case 0:
          case 1:
            if (args.length === 0 || args[0] === 'NOW') {
              output = output.replace(new RegExp(escapeRegExp(binding), "g"), formatDate(now, outputFormat));
            } else {
              output = output.replace(new RegExp(escapeRegExp(binding), "g"), formatDate(moment(args[0]), outputFormat));
            }
            break;
          case 2:
          case 3:
            if (args[0] === 'NOW') {
              output = output.replace(new RegExp(escapeRegExp(binding), "g"), formatDate(now.add(parseInt(args[1], 10), 'ms'), outputFormat, args[2]));
            } else {
              output = output.replace(new RegExp(escapeRegExp(binding), "g"), formatDate(moment(args[0]).add(parseInt(args[1], 10), 'ms'), outputFormat, args[2]));
            }

            break;
        }
      } catch (e) {
        console.log(e);
      }
    });
  }

  return output;
}

function formatDate(source, format, argFormat = null) {
  if (argFormat) {
    return source.format(argFormat).replace(/'/g, '').trim();
  }

  if (format) {
    return source.format(format).replace(/'/g, '').trim();
  } else {
    return source.format();
  }
}
