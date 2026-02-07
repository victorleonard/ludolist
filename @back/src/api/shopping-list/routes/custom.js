'use strict';

/**
 * Custom shopping-list routes
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/shopping-lists/family',
      handler: 'shopping-list.getByFamily',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
