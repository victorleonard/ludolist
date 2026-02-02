'use strict';

/**
 * dish-rating controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::dish-rating.dish-rating', ({ strapi }) => ({
  /**
   * Set or update a dish rating (1-10, or 0 to remove)
   */
  async setRating(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to rate a dish');
    }

    const { dishId, memberId, rating } = ctx.request.body;

    if (!dishId || !memberId || rating === undefined || rating === null) {
      return ctx.badRequest('dishId, memberId and rating are required');
    }

    if (rating !== 0 && (rating < 1 || rating > 10)) {
      return ctx.badRequest('Rating must be between 1 and 10, or 0 to remove');
    }

    try {
      const userWithFamily = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user.id,
        {
          populate: {
            family: {
              populate: {
                members: true,
                dishes: true,
              },
            },
          },
        },
      );

      if (!userWithFamily.family) {
        return ctx.forbidden('You must belong to a family to rate a dish');
      }

      const family = userWithFamily.family;

      const memberBelongsToFamily = family.members.some((m) => m.id === memberId);
      if (!memberBelongsToFamily) {
        return ctx.forbidden('This member does not belong to your family');
      }

      // Resolve dish by documentId or id
      const dishResolved = family.dishes?.find(
        (d) =>
          d.documentId === dishId ||
          d.id === dishId ||
          d.id === parseInt(dishId, 10),
      );
      if (!dishResolved) {
        return ctx.forbidden('This dish does not belong to your family');
      }
      const dishNumericId = dishResolved.id;

      const existingRatings = await strapi.entityService.findMany(
        'api::dish-rating.dish-rating',
        {
          filters: {
            dish: { id: dishNumericId },
            member: { id: memberId },
            family: { id: family.id },
          },
        },
      );

      if (rating === 0) {
        if (existingRatings && existingRatings.length > 0) {
          await strapi.entityService.delete(
            'api::dish-rating.dish-rating',
            existingRatings[0].id,
          );
        }
        return { data: null };
      }

      let result;
      if (existingRatings && existingRatings.length > 0) {
        result = await strapi.entityService.update(
          'api::dish-rating.dish-rating',
          existingRatings[0].id,
          {
            data: { rating },
            populate: ['member', 'dish'],
          },
        );
      } else {
        result = await strapi.entityService.create(
          'api::dish-rating.dish-rating',
          {
            data: {
              rating,
              dish: dishId,
              member: memberId,
              family: family.id,
            },
            populate: ['member', 'dish'],
          },
        );
      }

      return { data: result };
    } catch (err) {
      strapi.log.error('Error setting dish rating:', err);
      ctx.throw(500, 'Error setting rating');
    }
  },

  /**
   * Get ratings for a dish (family-scoped)
   */
  async getDishRatings(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You must be logged in to see ratings');
    }

    const { dishId } = ctx.params;

    if (!dishId) {
      return ctx.badRequest('dishId is required');
    }

    try {
      const userWithFamily = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user.id,
        {
          populate: {
            family: {
              populate: {
                dishes: true,
              },
            },
          },
        },
      );

      if (!userWithFamily.family) {
        return ctx.forbidden('You must belong to a family');
      }

      const family = userWithFamily.family;
      // Resolve dish by documentId or id
      const dishResolved = family.dishes?.find(
        (d) =>
          d.documentId === dishId ||
          d.id === dishId ||
          d.id === parseInt(dishId, 10),
      );
      if (!dishResolved) {
        return ctx.forbidden('This dish does not belong to your family');
      }
      const dishNumericId = dishResolved.id;

      const ratings = await strapi.entityService.findMany(
        'api::dish-rating.dish-rating',
        {
          filters: {
            dish: { id: dishNumericId },
            family: { id: family.id },
          },
          populate: ['member', 'dish'],
        },
      );

      return { data: ratings };
    } catch (err) {
      strapi.log.error('Error fetching dish ratings:', err);
      ctx.throw(500, 'Error fetching ratings');
    }
  },
}));
