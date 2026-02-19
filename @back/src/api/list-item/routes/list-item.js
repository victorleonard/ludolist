'use strict';

/**
 * list-item router - routes custom uniquement (documentId)
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/list-items/add-to-list',
      handler: 'list-item.addToList',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/list-items/reorder',
      handler: 'list-item.reorder',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/list-items/:documentId/toggle-checked',
      handler: 'list-item.toggleChecked',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/list-items/:documentId',
      handler: 'list-item.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/list-items/:documentId',
      handler: 'list-item.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
