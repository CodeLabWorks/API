import { getAccurateTime } from '../../../utils/timeUtils.js';
import { json } from '../../../utils/response.js';
import { getClientTimezoneFromRequest } from '../../../utils/geoUtils.js';

export default async function(request, env) {
  const params = new URL(request.url).searchParams;
  const zone = params.get('timezone') || (() => {
    try {
      return getClientTimezoneFromRequest(request).timezone;
    } catch {
      return 'UTC';
    }
  })();
  try {
    const now = getAccurateTime().setZone(zone);
    if (!now.isValid) throw new Error();
    // Rough DST active window
    const yearStart = now.startOf('year').setZone(zone);
    const dstFrom = yearStart.plus({ months: 3 }).startOf('month').toISO();
    const dstUntil = yearStart.plus({ months: 10 }).endOf('month').toISO();
    return json({ timezone: zone, is_dst: now.isInDST, dst_active_from: dstFrom, dst_active_until: dstUntil });
  } catch {
    return json({ error: 'invalid_timezone', message: 'Provided timezone is not valid' }, 400);
  }
}