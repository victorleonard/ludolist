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
  ],
};
