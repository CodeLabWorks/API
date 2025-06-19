import { faker } from '@faker-js/faker';
faker.locale = 'en';

export default async function () {
  const phone = faker.phone.number();
  return new Response(JSON.stringify({ phone }), { headers: { 'Content-Type': 'application/json' } });
}
