import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export default async function (request) {
  const url = new URL(request.url);
  const { coin } = Object.fromEntries(url.searchParams.entries());

  if (!coin) {
    return new Response(JSON.stringify({ error: 'Missing coin parameter' }), { status: 400 });
  }

  try {
    const response = await axios.get(`${COINGECKO_API}/simple/price`, {
      params: {
        ids: coin,
        vs_currencies: 'usd',
      },
    });

    return new Response(JSON.stringify({ price: response.data[coin]?.usd }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
