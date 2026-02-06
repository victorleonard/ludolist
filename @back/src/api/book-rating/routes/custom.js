module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/book-ratings/set',
      handler: 'book-rating.setRating',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/book-ratings/book/:bookId',
      handler: 'book-rating.getBookRatings',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
