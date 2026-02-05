'use strict';

/**
 * Routes personnalisées pour game
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/games/search-bgg',
      handler: 'game.searchBGG',
      config: {
        auth: false, // Route publique, pas besoin d'authentification
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/games/bgg-details/:bggId',
      handler: 'game.getBGGDetails',
      config: {
        auth: false, // Route publique, pas besoin d'authentification
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/games/add-from-bgg',
      handler: 'game.addFromBGG',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/games/change-owner',
      handler: 'game.changeOwner',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
