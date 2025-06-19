import { DateTime, Duration } from 'luxon';
import tzlookup from 'tz-lookup';

export function getAccurateTime() {
  return DateTime.utc();
}

export function formatTimeApiResponse(now, clientIp = '', location = {}) {
  return {
    datetime: now.toISO(),
    date: now.toISODate(),
    time: now.toFormat('HH:mm:ss'),
    utc_datetime: now.toUTC().toISO(),
    timezone: now.zoneName,
    utc_offset: now.toFormat('ZZ'),
    abbreviation: now.offsetNameShort,
    dst: now.isInDST,
    dst_offset: now.isInDST ? 3600 : 0,
    raw_offset: (now.offset - (now.isInDST ? 60 : 0)) * 60,
    unixtime: Math.floor(now.toSeconds()),
    day_of_week: now.weekday,
    day_of_year: now.ordinal,
    week_number: now.weekNumber,
    client_ip: clientIp,
    location: {
      lat: location.lat || null,
      lon: location.lon || null,
      country: location.country || null,
      city: location.city || null
    }
  };
}

export function parseISOWithZone(timeStr, zone) {
  if (timeStr.toLowerCase() === 'now') {
    return getAccurateTime().setZone(zone);
  }
  return DateTime.fromISO(timeStr, { zone });
}

export function parseISO(timeStr) {
  return DateTime.fromISO(timeStr);
}