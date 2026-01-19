module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/ratings/set',
      handler: 'rating.setRating',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/ratings/game/:gameId',
      handler: 'rating.getGameRatings',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
