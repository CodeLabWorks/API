import { faker } from '@faker-js/faker';
faker.locale = 'en';

export default async function () {
  const company = faker.company.name();
  return new Response(JSON.stringify({ company }), { headers: { 'Content-Type': 'application/json' } });
}
