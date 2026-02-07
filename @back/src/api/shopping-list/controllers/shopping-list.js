'use strict';

/**
 * shopping-list controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::shopping-list.shopping-list', ({ strapi }) => ({
  /**
   * Récupérer la liste de courses de la famille de l'utilisateur connecté
   */
  async getByFamily(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      // Récupérer la famille de l'utilisateur
      const family = await strapi.entityService.findMany('api::family.family', {
        filters: {
          users_permissions_user: {
            id: user.id,
          },
        },
        populate: {
          shopping_list: {
            populate: {
              items: {
                populate: {
                  created_by: true,
                },
              },
            },
          },
          grocery_items: {
            populate: {
              created_by: true,
            },
          },
        },
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.notFound('Famille non trouvée');
      }

      const userFamily = family[0];

      // Si la shopping list n'existe pas, la créer
      let shoppingListId = null;
      if (userFamily.shopping_list) {
        // Si c'est un objet, prendre l'ID, sinon c'est déjà un ID
        shoppingListId = typeof userFamily.shopping_list === 'object' 
          ? userFamily.shopping_list.id 
          : userFamily.shopping_list;
      }

      if (!shoppingListId) {
        const newShoppingList = await strapi.entityService.create('api::shopping-list.shopping-list', {
          data: {
            family: userFamily.id,
          },
        });

        // Mettre à jour la famille
        await strapi.entityService.update('api::family.family', userFamily.id, {
          data: {
            shopping_list: newShoppingList.id,
          },
        });

        shoppingListId = newShoppingList.id;
      }

      // Récupérer la shopping list avec tous les items
      const shoppingListWithItems = await strapi.entityService.findOne(
        'api::shopping-list.shopping-list',
        shoppingListId,
        {
          populate: {
            family: {
              populate: {
                users_permissions_user: true,
              },
            },
            items: {
              populate: {
                created_by: true,
              },
            },
          },
        }
      );

      // Vérification de sécurité supplémentaire : s'assurer que la shopping list appartient bien à la famille de l'utilisateur
      if (!shoppingListWithItems || !shoppingListWithItems.family) {
        return ctx.notFound('Liste de courses non trouvée');
      }

      const shoppingListFamilyId = typeof shoppingListWithItems.family === 'object'
        ? shoppingListWithItems.family.id
        : shoppingListWithItems.family;

      if (shoppingListFamilyId !== userFamily.id) {
        return ctx.forbidden('Cette liste de courses n\'appartient pas à votre famille');
      }

      return ctx.send({
        data: shoppingListWithItems,
      });
    } catch (error) {
      strapi.log.error('Erreur lors de la récupération de la liste de courses:', error);
      strapi.log.error('Stack trace:', error.stack);
      return ctx.internalServerError(
        `Erreur lors de la récupération de la liste: ${error.message || 'Erreur inconnue'}`
      );
    }
  },
}));
