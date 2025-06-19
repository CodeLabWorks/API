import { getAccurateTime, parseISOWithZone } from '../../../utils/timeUtils.js';
import { json } from '../../../utils/response.js';

export default async function(request, env) {
  const params = new URL(request.url).searchParams;
  const timeParam = params.get('time');
  const fromParam = params.get('from');
  const toParam = params.get('to');
  if (!timeParam || !fromParam || !toParam) {
    return json({ error: 'missing_parameters', message: 'All parameters (time, from, to) are required' }, 400);
  }
  const times = timeParam.split(',').map(t => t.trim());
  const fromZones = fromParam.split(',').map(f => f.trim());
  const toZones = toParam.split(',').map(t => t.trim());
  const multiMode = times.length > 1 || fromZones.length > 1 || toZones.length > 1;
  if (multiMode) {
    const maxLength = Math.max(times.length, fromZones.length, toZones.length);
    if (times.length !== maxLength || fromZones.length !== maxLength || toZones.length !== maxLength) {
      return json({ error: 'parameter_mismatch', message: 'When using multiple values, all parameters must have the same number of entries' }, 400);
    }
  }
  const results = [];
  for (let i = 0; i < (multiMode ? times.length : 1); i++) {
    const idx = multiMode ? i : 0;
    const time = times[idx], fromZone = fromZones[idx], toZone = toZones[idx];
    try {
      const sourceTime = parseISOWithZone(time, fromZone);
      if (!sourceTime.isValid) throw new Error('Invalid source time');
      const targetTime = sourceTime.setZone(toZone);
      if (!targetTime.isValid) throw new Error('Invalid target timezone');
      results.push({
        original: {
          datetime: sourceTime.toISO(),
          timezone: fromZone,
          iso_date: sourceTime.toISODate(),
          formatted_time: sourceTime.toFormat('HH:mm:ss'),
          is_now: time.toLowerCase() === 'now'
        },
        converted: {
          datetime: targetTime.toISO(),
          timezone: toZone,
          iso_date: targetTime.toISODate(),
          formatted_time: targetTime.toFormat('HH:mm:ss')
        },
        offset_change: targetTime.offset - sourceTime.offset,
        conversion_time: getAccurateTime().toISO()
      });
    } catch (error) {
      return json({ error: 'conversion_failed', message: `Failed to convert time: ${error.message}` }, 400);
    }
  }
  return json(multiMode ? { conversions: results } : results[0]);
}