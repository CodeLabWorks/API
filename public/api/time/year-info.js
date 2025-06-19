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
  return json({ year: now.year, is_leap_year: now.isInLeapYear, day_of_year: now.ordinal, days_remaining: 365 + (now.isInLeapYear ? 1 : 0) - now.ordinal, first_day: now.startOf('year').toISODate(), last_day: now.endOf('year').toISODate() });
}