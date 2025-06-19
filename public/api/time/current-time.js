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
  return json({ current_time: now.toFormat('HH:mm:ss'), hour_12: now.toFormat('hh:mm:ss a'), seconds_since_midnight: now.hour * 3600 + now.minute * 60 + now.second });
}