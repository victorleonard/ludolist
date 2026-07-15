module.exports = () => ({
  'users-permissions': {
    config: {
      jwt: {
        // Durée de validité du JWT après login (défaut Strapi : 30d)
        expiresIn: '365d',
      },
    },
  },
});
