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
  return json({ unixtime: Math.floor(now.toSeconds()), iso: now.toISO(), utc: now.toUTC().toISO() });
}