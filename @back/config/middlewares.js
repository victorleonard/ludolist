module.exports = ({ env }) => [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: env.array('CORS_ORIGIN', [
        'http://localhost:1337',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://vps-5dd72bcc.vps.ovh.net',
        'http://vps-5dd72bcc.vps.ovh.net:1338',
        'http://vps-5dd72bcc.vps.ovh.net:3001',
      ]),
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      credentials: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
