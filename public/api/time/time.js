import { getAccurateTime, formatTimeApiResponse } from '../../../utils/timeUtils.js';
import { json } from '../../../utils/response.js';
import { getClientTimezoneFromRequest } from '../../../utils/geoUtils.js';

export default async function(request, env) {
  let clientData;
  try {
    clientData = getClientTimezoneFromRequest(request);
  } catch (e) {
    return json({ error: 'geolocation_required', message: e.message }, 400);
  }
  const now = getAccurateTime().setZone(clientData.timezone);
  if (!now.isValid) {
    return json({ error: 'invalid_timezone', message: 'Could not determine valid timezone' }, 400);
  }
  return json(formatTimeApiResponse(now, request.headers.get('cf-connecting-ip') || '', clientData));
}