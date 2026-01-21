module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/game-sessions/game/:gameId',
      handler: 'game-session.getGameSessions',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'POST',
      path: '/game-sessions/create',
      handler: 'game-session.createGameSession',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'DELETE',
      path: '/game-sessions/:id',
      handler: 'game-session.deleteGameSession',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
