import { parseISO } from '../../../utils/timeUtils.js';
import { json } from '../../../utils/response.js';
import { Duration } from 'luxon';

export default async function(request, env) {
  const params = new URL(request.url).searchParams;
  const time1Param = params.get('time1');
  const time2Param = params.get('time2');
  if (!time1Param || !time2Param) {
    return json({ error: 'missing_parameters', message: 'Both time1 and time2 parameters are required' }, 400);
  }
  const times1 = time1Param.split(',').map(t => t.trim());
  const times2 = time2Param.split(',').map(t => t.trim());
  const multiMode = times1.length > 1 || times2.length > 1;
  if (multiMode && times1.length !== times2.length) {
    return json({ error: 'parameter_mismatch', message: 'time1 and time2 must have same number of entries' }, 400);
  }
  const results = [];
  for (let i = 0; i < (multiMode ? times1.length : 1); i++) {
    const idx = multiMode ? i : 0;
    const dt1 = parseISO(times1[idx]);
    const dt2 = parseISO(times2[idx]);
    if (!dt1.isValid || !dt2.isValid) {
      return json({ error: 'invalid_time', message: `Invalid time format at position ${idx+1}` }, 400);
    }
    const diffSeconds = dt2.diff(dt1, 'seconds').seconds;
    const duration = Duration.fromObject({ seconds: Math.abs(diffSeconds) }).shiftTo('days', 'hours', 'minutes', 'seconds').toObject();
    results.push({ time1: dt1.toISO(), time2: dt2.toISO(), difference_seconds: diffSeconds, absolute_duration: duration, is_negative: diffSeconds < 0 });
  }
  return json(multiMode ? { differences: results } : results[0]);
}