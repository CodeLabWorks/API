import { getAccurateTime } from '../../../utils/timeUtils.js';
import { json } from '../../../utils/response.js';
import { getClientTimezoneFromRequest } from '../../../utils/geoUtils.js';

export default async function(request, env) {
  const params = new URL(request.url).searchParams;
  const timeParam = params.get('time');
  if (!timeParam) {
    return json({ error: 'missing_parameter', message: 'Time parameter is required' }, 400);
  }
  let clientData;
  try {
    clientData = getClientTimezoneFromRequest(request);
  } catch {
    return json({ error: 'geolocation_required' }, 400);
  }
  try {
    const utcTime = DateTime.fromISO(timeParam, { zone: 'utc' });
    if (!utcTime.isValid) throw new Error('Invalid UTC time');
    const localTime = utcTime.setZone(clientData.timezone);
    return json({ utc_time: utcTime.toISO(), local_time: localTime.toISO(), timezone: clientData.timezone, offset_change: localTime.offset - utcTime.offset });
  } catch (error) {
    return json({ error: 'conversion_failed', message: 'Could not convert UTC to local time: ' + error.message }, 400);
  }
}