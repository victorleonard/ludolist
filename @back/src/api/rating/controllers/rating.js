'use strict';

/**
 * rating controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::rating.rating', ({ strapi }) => ({
  /**
   * Définir ou mettre à jour une note de manière sécurisée
   */
  async setRating(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Vous devez être connecté pour noter un jeu');
    }

    const { gameId, memberId, rating } = ctx.request.body;

    // Validation des données
    if (!gameId || !memberId || !rating) {
      return ctx.badRequest('gameId, memberId et rating sont requis');
    }

    if (rating < 1 || rating > 5) {
      return ctx.badRequest('La note doit être entre 1 et 5');
    }

    try {
      // Récupérer la famille de l'utilisateur
      const userWithFamily = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user.id,
        {
          populate: {
            family: {
              populate: {
                members: true,
                games: true
              }
            }
          }
        }
      );

      if (!userWithFamily.family) {
        return ctx.forbidden('Vous devez appartenir à une famille pour noter un jeu');
      }

      const family = userWithFamily.family;

      // Vérifier que le membre appartient à la famille
      const memberBelongsToFamily = family.members.some(m => m.id === memberId);
      if (!memberBelongsToFamily) {
        return ctx.forbidden('Ce membre n\'appartient pas à votre famille');
      }

      // Vérifier que le jeu appartient à la famille
      const gameBelongsToFamily = family.games.some(g => g.id === gameId);
      if (!gameBelongsToFamily) {
        return ctx.forbidden('Ce jeu n\'appartient pas à votre famille');
      }

      // Chercher si une note existe déjà
      const existingRatings = await strapi.entityService.findMany(
        'api::rating.rating',
        {
          filters: {
            game: { id: gameId },
            member: { id: memberId },
            family: { id: family.id }
          }
        }
      );

      let result;

      if (existingRatings && existingRatings.length > 0) {
        // Mettre à jour la note existante
        result = await strapi.entityService.update(
          'api::rating.rating',
          existingRatings[0].id,
          {
            data: {
              rating
            },
            populate: ['member', 'game']
          }
        );
      } else {
        // Créer une nouvelle note
        result = await strapi.entityService.create(
          'api::rating.rating',
          {
            data: {
              rating,
              game: gameId,
              member: memberId,
              family: family.id
            },
            populate: ['member', 'game']
          }
        );
      }

      return { data: result };
    } catch (err) {
      strapi.log.error('Erreur lors de la définition de la note:', err);
      ctx.throw(500, 'Erreur lors de la définition de la note');
    }
  },

  /**
   * Récupérer les notes d'un jeu de manière sécurisée
   */
  async getGameRatings(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Vous devez être connecté pour voir les notes');
    }

    const { gameId } = ctx.params;

    if (!gameId) {
      return ctx.badRequest('gameId est requis');
    }

    try {
      // Récupérer la famille de l'utilisateur
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

      // Vérifier que le jeu appartient à la famille
      const gameBelongsToFamily = family.games.some(g => g.id === parseInt(gameId, 10));
      if (!gameBelongsToFamily) {
        return ctx.forbidden('Ce jeu n\'appartient pas à votre famille');
      }

      // Récupérer les notes du jeu
      const ratings = await strapi.entityService.findMany(
        'api::rating.rating',
        {
          filters: {
            game: { id: gameId },
            family: { id: family.id }
          },
          populate: ['member', 'game']
        }
      );

      return { data: ratings };
    } catch (err) {
      strapi.log.error('Erreur lors de la récupération des notes:', err);
      ctx.throw(500, 'Erreur lors de la récupération des notes');
    }
  }
}));
