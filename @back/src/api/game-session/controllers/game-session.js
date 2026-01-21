'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::game-session.game-session', ({ strapi }) => ({
  async getGameSessions(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Vous devez être connecté pour voir les parties');
    }

    const { gameId } = ctx.params;

    if (!gameId) {
      return ctx.badRequest('gameId est requis');
    }

    try {
      const userWithFamily = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user.id,
        {
          populate: {
            family: {
              populate: {
                games: true
              }
            }
          }
        }
      );

      if (!userWithFamily.family) {
        return ctx.forbidden('Vous devez appartenir à une famille');
      }

      const family = userWithFamily.family;

      const gameBelongsToFamily = family.games.some(g => g.id === parseInt(gameId, 10));
      if (!gameBelongsToFamily) {
        return ctx.forbidden('Ce jeu n\'appartient pas à votre famille');
      }

      const sessions = await strapi.entityService.findMany(
        'api::game-session.game-session',
        {
          filters: {
            game: { id: gameId },
            family: { id: family.id }
          },
          populate: {
            player_scores: {
              populate: ['member']
            },
            game: true
          },
          sort: { played_at: 'desc' }
        }
      );

      return { data: sessions };
    } catch (err) {
      strapi.log.error('Erreur lors de la récupération des parties:', err);
      ctx.throw(500, 'Erreur lors de la récupération des parties');
    }
  },

  async createGameSession(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Vous devez être connecté pour créer une partie');
    }

    const { gameId, played_at, notes, player_scores } = ctx.request.body;

    if (!gameId) {
      return ctx.badRequest('gameId est requis');
    }

    if (!played_at) {
      return ctx.badRequest('played_at est requis');
    }

    if (!player_scores || !Array.isArray(player_scores) || player_scores.length === 0) {
      return ctx.badRequest('Au moins un score est requis');
    }

    try {
      const userWithFamily = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user.id,
        {
          populate: {
            family: {
              populate: {
                games: true
              }
            }
          }
        }
      );

      if (!userWithFamily.family) {
        return ctx.forbidden('Vous devez appartenir à une famille');
      }

      const family = userWithFamily.family;

      const gameBelongsToFamily = family.games.some(g => g.id === parseInt(gameId, 10));
      if (!gameBelongsToFamily) {
        return ctx.forbidden('Ce jeu n\'appartient pas à votre famille');
      }

      const session = await strapi.entityService.create(
        'api::game-session.game-session',
        {
          data: {
            game: gameId,
            family: family.id,
            played_at,
            notes: notes || null
          }
        }
      );

      const sortedScores = [...player_scores].sort((a, b) => b.score - a.score);
      const maxScore = Math.max(...player_scores.map(s => s.score));

      const scorePromises = player_scores.map(async (ps) => {
        const position = sortedScores.findIndex(s => s.memberId === ps.memberId) + 1;
        const isWinner = sortedScores.length > 0 && ps.score === maxScore && ps.score === sortedScores[0]?.score;

        return await strapi.entityService.create(
          'api::player-score.player-score',
          {
            data: {
              member: ps.memberId,
              game_session: session.id,
              score: ps.score,
              is_winner: isWinner,
              position
            }
          }
        );
      });

      await Promise.all(scorePromises);

      const fullSession = await strapi.entityService.findOne(
        'api::game-session.game-session',
        session.id,
        {
          populate: {
            player_scores: {
              populate: ['member']
            },
            game: true
          }
        }
      );

      return { data: fullSession };
    } catch (err) {
      strapi.log.error('Erreur lors de la création de la partie:', err);
      ctx.throw(500, 'Erreur lors de la création de la partie');
    }
  },

  async deleteGameSession(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Vous devez être connecté pour supprimer une partie');
    }

    const { id } = ctx.params;

    if (!id) {
      return ctx.badRequest('id est requis');
    }

    try {
      const userWithFamily = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user.id,
        {
          populate: {
            family: true
          }
        }
      );

      if (!userWithFamily.family) {
        return ctx.forbidden('Vous devez appartenir à une famille');
      }

      const family = userWithFamily.family;

      const session = await strapi.entityService.findOne(
        'api::game-session.game-session',
        id,
        {
          populate: {
            family: true,
            player_scores: true
          }
        }
      );

      if (!session) {
        return ctx.notFound('Partie non trouvée');
      }

      if (session.family.id !== family.id) {
        return ctx.forbidden('Cette partie n\'appartient pas à votre famille');
      }

      if (session.player_scores && session.player_scores.length > 0) {
        const deleteScorePromises = session.player_scores.map(score =>
          strapi.entityService.delete('api::player-score.player-score', score.id)
        );
        await Promise.all(deleteScorePromises);
      }

      await strapi.entityService.delete('api::game-session.game-session', id);

      return { data: { id } };
    } catch (err) {
      strapi.log.error('Erreur lors de la suppression de la partie:', err);
      ctx.throw(500, 'Erreur lors de la suppression de la partie');
    }
  }
}));
