'use strict';

/**
 * grocery-item controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::grocery-item.grocery-item', ({ strapi }) => ({
  /**
   * Ajouter un produit à la liste de courses de la famille
   * Recherche si un produit avec le même nom existe déjà
   */
  async addToFamily(ctx) {
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
          grocery_items: true,
          shopping_list: {
            populate: {
              items: true,
            },
          },
        },
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.notFound('Famille non trouvée');
      }

      const userFamily = family[0];
      const { name, memberId } = ctx.request.body;

      if (!name || !name.trim()) {
        return ctx.badRequest('Le nom du produit est requis');
      }

      const normalizedName = name.trim().toLowerCase();

      // Rechercher si un produit avec le même nom existe déjà dans la famille
      const existingItems = await strapi.entityService.findMany('api::grocery-item.grocery-item', {
        filters: {
          family: {
            id: userFamily.id,
          },
        },
      });

      const existingItem = existingItems.find(
        (item) => item.name.trim().toLowerCase() === normalizedName
      );

      if (existingItem) {
        // Si le produit existe déjà et n'est pas coché, le retourner
        const itemWithRelations = await strapi.entityService.findOne(
          'api::grocery-item.grocery-item',
          existingItem.id,
          {
            populate: {
              family: true,
              created_by: true,
              shopping_list: true,
            },
          }
        );

        return ctx.send({
          data: itemWithRelations,
          message: 'Produit déjà présent dans la liste',
          alreadyExists: true,
        });
      }

      // Vérifier que memberId appartient à la famille si fourni
      let createdByMemberId = null;
      if (memberId != null) {
        const familyWithMembers = await strapi.entityService.findOne(
          'api::family.family',
          userFamily.id,
          { populate: { members: true } }
        );
        const memberExists = familyWithMembers.members?.some(
          (m) => m.id === memberId || m.id === Number(memberId)
        );
        if (!memberExists) {
          return ctx.badRequest("Ce membre n'appartient pas à votre famille");
        }
        createdByMemberId = Number(memberId);
      }

      // Récupérer ou créer la shopping list de la famille
      let shoppingListId = null;
      if (userFamily.shopping_list) {
        // Si c'est un objet, prendre l'ID, sinon c'est déjà un ID
        shoppingListId = typeof userFamily.shopping_list === 'object'
          ? userFamily.shopping_list.id
          : userFamily.shopping_list;

        // Vérification de sécurité : s'assurer que la shopping list appartient bien à cette famille
        const existingShoppingList = await strapi.entityService.findOne(
          'api::shopping-list.shopping-list',
          shoppingListId,
          {
            populate: {
              family: true,
            },
          }
        );

        if (!existingShoppingList) {
          return ctx.internalServerError('Erreur lors de la récupération de la liste de courses');
        }

        const existingListFamilyId = typeof existingShoppingList.family === 'object'
          ? existingShoppingList.family.id
          : existingShoppingList.family;

        if (existingListFamilyId !== userFamily.id) {
          return ctx.forbidden('Cette liste de courses n\'appartient pas à votre famille');
        }
      }

      if (!shoppingListId) {
        // Créer la shopping list si elle n'existe pas
        const newShoppingList = await strapi.entityService.create('api::shopping-list.shopping-list', {
          data: {
            family: userFamily.id,
          },
        });

        // Mettre à jour la famille avec la shopping list
        await strapi.entityService.update('api::family.family', userFamily.id, {
          data: {
            shopping_list: newShoppingList.id,
          },
        });

        shoppingListId = newShoppingList.id;
      }

      // Créer le nouveau produit
      const itemData = {
        name: name.trim(),
        family: userFamily.id,
        shopping_list: shoppingListId,
        is_checked: false,
        ...(createdByMemberId != null && { created_by: createdByMemberId }),
      };

      const createdItem = await strapi.entityService.create('api::grocery-item.grocery-item', {
        data: itemData,
      });

      // Récupérer le produit créé avec ses relations
      const itemWithRelations = await strapi.entityService.findOne(
        'api::grocery-item.grocery-item',
        createdItem.id,
        {
          populate: {
            family: true,
            created_by: true,
            shopping_list: true,
          },
        }
      );

      return ctx.created({
        data: itemWithRelations,
        message: 'Produit ajouté à la liste de courses',
        alreadyExists: false,
      });
    } catch (error) {
      strapi.log.error('Erreur lors de l\'ajout du produit:', error);
      return ctx.internalServerError('Erreur lors de l\'ajout du produit');
    }
  },

  /**
   * Cocher ou décocher un produit
   */
  async toggleChecked(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const { id } = ctx.params;

      // Résoudre l'ID (peut être documentId ou id numérique)
      let item = null;
      let itemNumericId = null;

      // Essayer d'abord avec documentId (string)
      if (typeof id === 'string' && !id.match(/^\d+$/)) {
        const itemsByDocumentId = await strapi.entityService.findMany('api::grocery-item.grocery-item', {
          filters: { documentId: id },
          populate: {
            family: {
              populate: {
                users_permissions_user: true,
              },
            },
          },
          limit: 1,
        });
        if (itemsByDocumentId && itemsByDocumentId.length > 0) {
          item = itemsByDocumentId[0];
          itemNumericId = item.id;
        }
      } else {
        // Fallback sur id numérique
        itemNumericId = typeof id === 'number' ? id : parseInt(id, 10);
        item = await strapi.entityService.findOne('api::grocery-item.grocery-item', itemNumericId, {
          populate: {
            family: {
              populate: {
                users_permissions_user: true,
              },
            },
          },
        });
      }

      if (!item) {
        return ctx.notFound('Produit non trouvé');
      }

      // Vérifier que le produit appartient à la famille de l'utilisateur
      const family = await strapi.entityService.findMany('api::family.family', {
        filters: {
          users_permissions_user: {
            id: user.id,
          },
        },
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.forbidden('Vous n\'appartenez à aucune famille');
      }

      const userFamily = family[0];
      const itemFamilyId = typeof item.family === 'object' ? item.family.id : item.family;

      if (!itemFamilyId || itemFamilyId !== userFamily.id) {
        return ctx.forbidden('Ce produit n\'appartient pas à votre famille');
      }

      // Inverser l'état is_checked en utilisant l'ID numérique
      const updatedItem = await strapi.entityService.update('api::grocery-item.grocery-item', itemNumericId, {
        data: {
          is_checked: !item.is_checked,
        },
        populate: {
          family: true,
          created_by: true,
          shopping_list: true,
        },
      });

      return ctx.send({
        data: updatedItem,
        message: `Produit ${updatedItem.is_checked ? 'coché' : 'décoché'}`,
      });
    } catch (error) {
      strapi.log.error('Erreur lors du changement d\'état du produit:', error);
      return ctx.internalServerError('Erreur lors du changement d\'état');
    }
  },

  /**
   * Modifier un produit
   */
  async update(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const { id } = ctx.params;
      const { name } = ctx.request.body;

      if (!name || !name.trim()) {
        return ctx.badRequest('Le nom du produit est requis');
      }

      // Résoudre l'ID (peut être documentId ou id numérique)
      let item = null;
      let itemNumericId = null;

      // Essayer d'abord avec documentId (string)
      if (typeof id === 'string' && !id.match(/^\d+$/)) {
        const itemsByDocumentId = await strapi.entityService.findMany('api::grocery-item.grocery-item', {
          filters: { documentId: id },
          populate: {
            family: true,
          },
          limit: 1,
        });
        if (itemsByDocumentId && itemsByDocumentId.length > 0) {
          item = itemsByDocumentId[0];
          itemNumericId = item.id;
        }
      } else {
        // Fallback sur id numérique
        itemNumericId = typeof id === 'number' ? id : parseInt(id, 10);
        item = await strapi.entityService.findOne('api::grocery-item.grocery-item', itemNumericId, {
          populate: {
            family: true,
          },
        });
      }

      if (!item) {
        return ctx.notFound('Produit non trouvé');
      }

      // Vérifier que le produit appartient à la famille de l'utilisateur
      const family = await strapi.entityService.findMany('api::family.family', {
        filters: {
          users_permissions_user: {
            id: user.id,
          },
        },
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.forbidden('Vous n\'appartenez à aucune famille');
      }

      const userFamily = family[0];
      const itemFamilyId = typeof item.family === 'object' ? item.family.id : item.family;

      if (!itemFamilyId || itemFamilyId !== userFamily.id) {
        return ctx.forbidden('Ce produit n\'appartient pas à votre famille');
      }

      // Mettre à jour le produit en utilisant l'ID numérique
      const updatedItem = await strapi.entityService.update('api::grocery-item.grocery-item', itemNumericId, {
        data: {
          name: name.trim(),
        },
        populate: {
          family: true,
          created_by: true,
          shopping_list: true,
        },
      });

      return ctx.send({
        data: updatedItem,
        message: 'Produit modifié avec succès',
      });
    } catch (error) {
      strapi.log.error('Erreur lors de la modification du produit:', error);
      return ctx.internalServerError('Erreur lors de la modification');
    }
  },

  /**
   * Supprimer un produit
   */
  async delete(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const { id } = ctx.params;

      // Résoudre l'ID (peut être documentId ou id numérique)
      let item = null;
      let itemNumericId = null;

      // Essayer d'abord avec documentId (string)
      if (typeof id === 'string' && !id.match(/^\d+$/)) {
        const itemsByDocumentId = await strapi.entityService.findMany('api::grocery-item.grocery-item', {
          filters: { documentId: id },
          populate: {
            family: true,
          },
          limit: 1,
        });
        if (itemsByDocumentId && itemsByDocumentId.length > 0) {
          item = itemsByDocumentId[0];
          itemNumericId = item.id;
        }
      } else {
        // Fallback sur id numérique
        itemNumericId = typeof id === 'number' ? id : parseInt(id, 10);
        item = await strapi.entityService.findOne('api::grocery-item.grocery-item', itemNumericId, {
          populate: {
            family: true,
          },
        });
      }

      if (!item) {
        return ctx.notFound('Produit non trouvé');
      }

      // Vérifier que le produit appartient à la famille de l'utilisateur
      const family = await strapi.entityService.findMany('api::family.family', {
        filters: {
          users_permissions_user: {
            id: user.id,
          },
        },
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.forbidden('Vous n\'appartenez à aucune famille');
      }

      const userFamily = family[0];
      const itemFamilyId = typeof item.family === 'object' ? item.family.id : item.family;

      if (!itemFamilyId || itemFamilyId !== userFamily.id) {
        return ctx.forbidden('Ce produit n\'appartient pas à votre famille');
      }

      // Supprimer le produit en utilisant l'ID numérique
      await strapi.entityService.delete('api::grocery-item.grocery-item', itemNumericId);

      return ctx.send({
        message: 'Produit supprimé avec succès',
      });
    } catch (error) {
      strapi.log.error('Erreur lors de la suppression du produit:', error);
      return ctx.internalServerError('Erreur lors de la suppression');
    }
  },
}));
