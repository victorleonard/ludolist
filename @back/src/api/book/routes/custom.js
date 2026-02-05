'use strict';

/**
 * Custom book routes
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/books/add-to-family',
      handler: 'book.addToFamily',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/books/change-owner',
      handler: 'book.changeOwner',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
