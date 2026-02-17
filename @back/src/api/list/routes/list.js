'use strict';

/**
 * list router - routes custom uniquement (documentId)
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/lists/family',
      handler: 'list.getByFamily',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/lists/:documentId',
      handler: 'list.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/lists',
      handler: 'list.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/lists/:documentId',
      handler: 'list.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/lists/:documentId',
      handler: 'list.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
