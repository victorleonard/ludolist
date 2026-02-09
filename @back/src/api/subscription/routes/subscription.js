'use strict';

/**
 * subscription router
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/subscriptions/add-to-family',
      handler: 'subscription.addToFamily',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/subscriptions',
      handler: 'subscription.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/subscriptions/:id',
      handler: 'subscription.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/subscriptions/:id',
      handler: 'subscription.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/subscriptions/:id',
      handler: 'subscription.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
