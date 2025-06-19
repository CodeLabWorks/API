import { faker } from '@faker-js/faker';
faker.locale = 'en';

export default async function () {
  const geo = {
    latitude: faker.location.latitude(),
    longitude: faker.location.longitude(),
  };
  return new Response(JSON.stringify(geo), { headers: { 'Content-Type': 'application/json' } });
}
