'use strict';

/**
 * dish controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::dish.dish', ({ strapi }) => ({
  /**
   * Add a dish to the current user's family (creates dish with family link)
   */
  async addToFamily(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('You must be logged in');
      }

      const family = await strapi.entityService.findMany('api::family.family', {
        filters: {
          users_permissions_user: {
            id: user.id,
          },
        },
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.notFound('Family not found');
      }

      const userFamily = family[0];
      const { name, description, image_url, image } = ctx.request.body;

      if (!name || !name.trim()) {
        return ctx.badRequest('name is required');
      }

      const dishData = {
        name: name.trim(),
        description: description?.trim() || null,
        image_url: image_url || null,
        ...(image != null && { image }),
        family: userFamily.id,
        publishedAt: new Date().toISOString(),
      };

      const createdDish = await strapi.entityService.create('api::dish.dish', {
        data: dishData,
      });

      const dishWithRelations = await strapi.entityService.findOne(
        'api::dish.dish',
        createdDish.id,
        {
          populate: {
            image: true,
            family: true,
            ratings: {
              populate: ['member'],
            },
          },
        },
      );

      return ctx.created({
        data: dishWithRelations,
        message: 'Dish added to family',
      });
    } catch (error) {
      strapi.log.error('Error adding dish to family:', error);
      return ctx.internalServerError('Error adding dish');
    }
  },
}));
