import { faker } from '@faker-js/faker';
faker.locale = 'en';

export default async function () {
  const iban = faker.finance.iban();
  return new Response(JSON.stringify({ iban }), { headers: { 'Content-Type': 'application/json' } });
}
