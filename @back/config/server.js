module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  app: {
    keys: env.array('APP_KEYS'),
    // URL publique du serveur (pour les webhooks, emails, etc.)
    // Doit être définie dans le fichier .env
    url: env('PUBLIC_URL'),
  },
  webhooks: {
    populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
  },
});
