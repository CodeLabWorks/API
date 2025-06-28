import geoip from 'geoip-lite';

export default async function (request) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);
  const ip = parts[1];

  if (!ip) {
    return new Response(
      JSON.stringify({ error: 'Missing IP address in path; use /ip/<address>' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const geo = geoip.lookup(ip);

    if (!geo) {
      return new Response(
        JSON.stringify({ error: `No geo data found for IP ${ip}` }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }


    return new Response(
      JSON.stringify({ ip, geo }, null, 2),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
