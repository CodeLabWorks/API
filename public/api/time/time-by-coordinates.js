import { getAccurateTime } from '../../../utils/timeUtils.js';
import { json } from '../../../utils/response.js';
import tzlookup from 'tz-lookup';

export default async function(request, env) {
  const params = new URL(request.url).searchParams;
  const lat = parseFloat(params.get('lat'));
  const lon = parseFloat(params.get('lon'));
  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return json({ error: 'invalid_coordinates', message: 'Valid latitude (-90 to 90) and longitude (-180 to 180) required' }, 400);
  }
  try {
    const tz = tzlookup(lat, lon);
    const now = getAccurateTime().setZone(tz);
    return json({ timezone: tz, datetime: now.toISO(), coordinates: { lat, lon }, utc_offset: now.toFormat('ZZ') });
  } catch {
    return json({ error: 'timezone_lookup_failed', message: 'Could not determine timezone from coordinates' }, 400);
  }
}