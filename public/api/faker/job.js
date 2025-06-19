import { faker } from '@faker-js/faker';
faker.locale = 'en';

export default async function () {
  const job = faker.person.jobTitle();
  return new Response(JSON.stringify({ job }), { headers: { 'Content-Type': 'application/json' } });
}
