'use strict';

/**
 * list-category router
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/list-categories',
      handler: 'list-category.create',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/list-categories/reorder',
      handler: 'list-category.reorder',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/list-categories/:documentId',
      handler: 'list-category.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/list-categories/:documentId',
      handler: 'list-category.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
