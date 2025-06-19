import { faker } from '@faker-js/faker';
faker.locale = 'en';

export default async function () {
  const name = faker.person.fullName();
  return new Response(JSON.stringify({ name }), { headers: { 'Content-Type': 'application/json' } });
}
