import { ethers } from 'ethers';

export default async function () {
  try {
    const wallet = ethers.Wallet.createRandom();

    return new Response(
      JSON.stringify({
        address: wallet.address,
        privateKey: wallet.privateKey,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
