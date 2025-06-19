import { faker } from '@faker-js/faker';
faker.locale = 'en';

export default async function () {
  const email = faker.internet.email();
  return new Response(JSON.stringify({ email }), { headers: { 'Content-Type': 'application/json' } });
}
