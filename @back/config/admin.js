module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
  // Configuration de l'URL de l'admin panel
  url: env('ADMIN_URL', '/admin'),
  // Forcer la construction de l'admin panel en production
  autoOpen: false,
  // Désactiver le serveur de développement pour forcer l'utilisation du build
  serveAdminPanel: true,
});
