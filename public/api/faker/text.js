import { faker } from '@faker-js/faker';
faker.locale = 'en';

export default async function () {
  const sentences = Array.from({ length: 5 }, () => faker.lorem.sentence());
  const text = sentences.join(' ');
  return new Response(JSON.stringify({ text }), { headers: { 'Content-Type': 'application/json' } });
}
