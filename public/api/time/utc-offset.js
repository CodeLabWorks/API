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
    return json({ timezone: zone, utc_offset: now.toFormat('ZZ'), offset_minutes: now.offset, is_dst: now.isInDST });
  } catch {
    return json({ error: 'invalid_timezone', message: 'Provided timezone is not valid' }, 400);
  }
}