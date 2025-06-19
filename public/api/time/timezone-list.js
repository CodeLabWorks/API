import { json } from '../../../utils/response.js';

export default async function(request, env) {
  try {
    const timezones = Intl.supportedValuesOf('timeZone');
    return json({ count: timezones.length, timezones });
  } catch {
    return json({ error: 'timezone_list_unavailable', message: 'Could not retrieve timezone list' }, 500);
  }
}