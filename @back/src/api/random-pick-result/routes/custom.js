'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/random-pick-results/create',
      handler: 'random-pick-result.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/random-pick-results/family',
      handler: 'random-pick-result.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/random-pick-results/:documentId',
      handler: 'random-pick-result.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
