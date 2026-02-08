'use strict';

/**
 * task router
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/tasks/add-to-family',
      handler: 'task.addToFamily',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/tasks',
      handler: 'task.find',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/tasks/:id',
      handler: 'task.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/tasks/:id',
      handler: 'task.update',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'PUT',
      path: '/tasks/:id/toggle-completed',
      handler: 'task.toggleCompleted',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/tasks/:id',
      handler: 'task.delete',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
