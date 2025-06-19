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
  return json({ month: now.month, month_name: now.monthLong, days_in_month: now.daysInMonth, days_remaining: now.daysInMonth - now.day, first_day: now.startOf('month').toISODate(), last_day: now.endOf('month').toISODate() });
}