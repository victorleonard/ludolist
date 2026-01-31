'use strict';

/**
 * Custom book-reading routes
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/book-readings/upsert',
      handler: 'book-reading.upsert',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/book-readings/member/:memberId',
      handler: 'book-reading.findByMember',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/book-readings/book/:bookId',
      handler: 'book-reading.findByBook',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
