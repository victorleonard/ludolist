'use strict';

/**
 * Routes personnalisées pour family
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/families/me',
      handler: 'family.me',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/families/me/page-access',
      handler: 'family.updatePageAccess',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
