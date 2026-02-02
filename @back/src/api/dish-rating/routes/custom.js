'use strict';

/**
 * Custom dish-rating routes
 */

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/dish-ratings/set',
      handler: 'dish-rating.setRating',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/dish-ratings/dish/:dishId',
      handler: 'dish-rating.getDishRatings',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
