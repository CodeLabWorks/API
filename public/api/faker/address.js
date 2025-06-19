import { faker } from '@faker-js/faker';
faker.locale = 'en';

export default async function () {
  const address = faker.location.streetAddress(true);
  return new Response(JSON.stringify({ address }), { headers: { 'Content-Type': 'application/json' } });
}
