import { getAccurateTime, formatTimeApiResponse } from '../../../utils/timeUtils.js';
import { json } from '../../../utils/response.js';

export default async function(request, env) {
  const pathname = new URL(request.url).pathname;
  const zone = decodeURIComponent(pathname.split('/api/timezone/')[1] || '');
  if (!zone) {
    return json({ error: 'missing_parameter', message: 'Timezone parameter is required in URL path' }, 400);
  }
  try {
    const now = getAccurateTime().setZone(zone);
    if (!now.isValid) throw new Error();
    return json(formatTimeApiResponse(now));
  } catch {
    return json({ error: 'invalid_timezone', message: 'Provided timezone is not valid' }, 400);
  }
}