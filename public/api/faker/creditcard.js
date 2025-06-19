import { faker } from '@faker-js/faker';
faker.locale = 'en';

export default async function () {
  const card = {
    number: faker.finance.creditCardNumber(),
    name: faker.person.fullName(),
    expiry: faker.date.future().toISOString().slice(0, 7),
    cvv: faker.finance.creditCardCVV(),
  };
  return new Response(JSON.stringify(card), { headers: { 'Content-Type': 'application/json' } });
}
