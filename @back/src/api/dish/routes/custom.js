'use strict';

/**
 * Custom dish routes
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/dishes/add-to-family',
      handler: 'dish.addToFamily',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
