module.exports = ({ env }) => {
  const host = env('HOST', '0.0.0.0');
  const port = env.int('PORT', 1337);
  // Construire l'URL publique si elle n'est pas définie dans .env
  // Utiliser localhost si HOST est 0.0.0.0 pour les URLs
  const publicUrl = env('PUBLIC_URL') || (host === '0.0.0.0' ? `http://localhost:${port}` : `http://${host}:${port}`);
  
  return {
    host,
    port,
    app: {
      keys: env.array('APP_KEYS'),
      // URL publique du serveur (pour les webhooks, emails, etc.)
      // Si PUBLIC_URL n'est pas défini dans .env, construit automatiquement
      url: publicUrl,
    },
    webhooks: {
      populateRelations: env.bool('WEBHOOKS_POPULATE_RELATIONS', false),
    },
  };
};
