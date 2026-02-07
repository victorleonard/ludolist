'use strict';

/**
 * Custom grocery-item routes
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/grocery-items/add-to-family',
      handler: 'grocery-item.addToFamily',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/grocery-items/:id/toggle-checked',
      handler: 'grocery-item.toggleChecked',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/grocery-items/:id',
      handler: 'grocery-item.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/grocery-items/:id',
      handler: 'grocery-item.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
