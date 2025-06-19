import { getAccurateTime } from '../../../utils/timeUtils.js';
import { json } from '../../../utils/response.js';
import { getClientTimezoneFromRequest } from '../../../utils/geoUtils.js';

export default async function(request, env) {
  let clientData;
  try {
    clientData = getClientTimezoneFromRequest(request);
  } catch {
    return json({ error: 'geolocation_required' }, 400);
  }
  const now = getAccurateTime().setZone(clientData.timezone);
  return json({ accurate_time: now.toISO(), nanoseconds: now.toMillis() * 1000000, source: 'system_clock' });
}