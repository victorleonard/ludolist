'use strict';

/**
 * Custom member routes
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/members/login',
      handler: 'member.login',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/members/:id/settings',
      handler: 'member.getSettings',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/members/:id/settings',
      handler: 'member.updateSettings',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PATCH',
      path: '/members/:id/admin',
      handler: 'member.setMemberAdmin',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
