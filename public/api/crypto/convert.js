import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';

export default async function (request) {
  const url = new URL(request.url);
  const { from_coin, to, amount } = Object.fromEntries(url.searchParams.entries());

  if (!from_coin || !to || !amount) {
    return new Response(JSON.stringify({ error: 'Missing query parameters' }), { status: 400 });
  }

  try {
    const [fromRes, toRes] = await Promise.all([
      axios.get(`${COINGECKO_API}/simple/price`, { params: { ids: from_coin, vs_currencies: 'usd' } }),
      axios.get(`${COINGECKO_API}/simple/price`, { params: { ids: to, vs_currencies: 'usd' } }),
    ]);

    const fromUSD = fromRes.data[from_coin]?.usd;
    const toUSD = toRes.data[to]?.usd;

    if (!fromUSD || !toUSD) {
      return new Response(JSON.stringify({ error: 'Invalid coin symbol' }), { status: 400 });
    }

    const result = (parseFloat(amount) * fromUSD) / toUSD;
    return new Response(JSON.stringify({ converted: result }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
