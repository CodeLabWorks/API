import tzlookup from 'tz-lookup';

export function getClientTimezoneFromRequest(request) {
  const cf = request.cf;
  if (cf?.latitude && cf?.longitude) {
    const tz = tzlookup(cf.latitude, cf.longitude);
    return {
      timezone: tz,
      lat: cf.latitude,
      lon: cf.longitude,
      city: cf.city || null,
      country: cf.country || null
    };
  }
  throw new Error('Unable to determine timezone. Geolocation data unavailable.');
}