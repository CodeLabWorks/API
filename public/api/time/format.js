import { parseISO } from '../../../utils/timeUtils.js';
import { json } from '../../../utils/response.js';

export default async function(request, env) {
  const params = new URL(request.url).searchParams;
  const timeParam = params.get('time');
  const format = params.get('format') || "ff";
  if (!timeParam) {
    return json({ error: 'missing_parameter', message: 'Time parameter is required' }, 400);
  }
  const dt = parseISO(timeParam);
  if (!dt.isValid) {
    return json({ error: 'format_failed', message: 'Invalid time format' }, 400);
  }
  try {
    return json({ original: timeParam, formatted: dt.toFormat(format), format_used: format });
  } catch (e) {
    return json({ error: 'format_failed', message: e.message }, 400);
  }
}