/**
 * Datify source
 * Possible bindings:
 * {{DATE(NOW)}} - actual date
 * {{DATE('13-05-2019')}} - date to parse
 * {{DATE('13-05-2019', 0, 'dd-mm-yyyy')}} - date to parse with custom outputFormat
 * {{DATE(NOW, 500)}} - actual date plus 500ms
 * {{DATE('13-05-2019', 500)}} - selected date plus 500ms, moment js parse formats supported
 *
 * @param source
 * @param outputFormat
 */
import {datify} from "./datify";
import moment = require("moment");

describe('Datify', () => {
  it('should create add current data in place of pattern', () => {
    const input = `{date:'{{DATE(NOW)}}'}`;
    const output = `{date:'${moment().format()}'}`;

    expect(datify(input)).toBe(output);
  });

  it('should add 2 second to current date', () => {
    const input = `{date:'{{DATE(NOW, 2000)}}'}`;
    const output = `{date:'${moment().add(2, 's').format()}'}`;

    expect(datify(input)).toBe(output);
  });

  it('should add 2 seconds to existing date', () => {
    const input = `{date:'{{DATE('13-05-2019')}}'}`;
    const output = `{date:'${moment('13-05-2019').add(2, 's').format()}'}`;

    expect(datify(input)).toBe(output);
  });

  it('should format current date properly', () => {
    const format = 'D-M-Y';
    const input = `{date:'{{DATE(NOW,0, '${format}')}}'}`;
    const output = `{date:'${moment().format(format)}'}`;

    expect(datify(input)).toBe(output);
  });
});
