'use strict';

/**
 * list-item controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

function resolveItemByDocumentId(strapi, documentId) {
  return strapi.entityService.findMany('api::list-item.list-item', {
    filters: { documentId },
    populate: { family: true, list: true },
    limit: 1,
  });
}

module.exports = createCoreController('api::list-item.list-item', ({ strapi }) => ({
  /**
   * Ajouter un élément à une liste (body: listDocumentId, name, memberId?)
   */
  async addToList(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const family = await strapi.entityService.findMany('api::family.family', {
        filters: { users_permissions_user: { id: user.id } },
        populate: { members: true },
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.forbidden('Vous n\'appartenez à aucune famille');
      }

      const userFamily = family[0];
      const body = ctx.request.body?.data ?? ctx.request.body ?? {};
      const { listDocumentId, name, memberId } = body;

      if (!listDocumentId || typeof listDocumentId !== 'string') {
        return ctx.badRequest('listDocumentId requis');
      }
      if (!name || !String(name).trim()) {
        return ctx.badRequest('Le nom de l\'élément est requis');
      }

      const lists = await strapi.entityService.findMany('api::list.list', {
        filters: { documentId: listDocumentId },
        populate: { family: true, allowed_members: true },
        limit: 1,
      });

      if (!lists || lists.length === 0) {
        return ctx.notFound('Liste non trouvée');
      }

      const list = lists[0];
      const listFamilyId = typeof list.family === 'object' ? list.family.id : list.family;
      if (listFamilyId !== userFamily.id) {
        return ctx.forbidden('Cette liste n\'appartient pas à votre famille');
      }

      let createdByMemberId = null;
      if (memberId != null) {
        const memberExists = userFamily.members?.some(
          (m) => m.id === Number(memberId) || m.id === memberId
        );
        if (!memberExists) {
          return ctx.badRequest('Ce membre n\'appartient pas à votre famille');
        }
        createdByMemberId = Number(memberId);
      }

      const created = await strapi.entityService.create('api::list-item.list-item', {
        data: {
          name: String(name).trim(),
          is_checked: false,
          list: list.id,
          family: userFamily.id,
          ...(createdByMemberId != null && { created_by: createdByMemberId }),
        },
      });

      const withRelations = await strapi.entityService.findOne(
        'api::list-item.list-item',
        created.id,
        { populate: ['family', 'list', 'created_by', 'checked_by'] }
      );

      return ctx.created({ data: withRelations });
    } catch (error) {
      strapi.log.error('Erreur lors de l\'ajout de l\'élément:', error);
      return ctx.internalServerError('Erreur lors de l\'ajout de l\'élément');
    }
  },

  /**
   * Cocher / décocher par documentId
   */
  async toggleChecked(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const { documentId } = ctx.params;
      const body = ctx.request.body?.data ?? ctx.request.body ?? {};
      const memberId = body.memberId != null ? Number(body.memberId) : null;

      if (!documentId || typeof documentId !== 'string') {
        return ctx.badRequest('documentId requis');
      }

      const items = await resolveItemByDocumentId(strapi, documentId);
      if (!items || items.length === 0) {
        return ctx.notFound('Élément non trouvé');
      }

      const item = items[0];
      const family = await strapi.entityService.findMany('api::family.family', {
        filters: { users_permissions_user: { id: user.id } },
        populate: { members: true },
        limit: 1,
      });
      if (!family || family.length === 0) {
        return ctx.forbidden('Vous n\'appartenez à aucune famille');
      }
      const userFamily = family[0];
      const itemFamilyId = typeof item.family === 'object' ? item.family.id : item.family;
      if (itemFamilyId !== userFamily.id) {
        return ctx.forbidden('Cet élément n\'appartient pas à votre famille');
      }

      const newChecked = !item.is_checked;
      const updateData = { is_checked: newChecked };
      if (newChecked && memberId != null) {
        const memberExists = (userFamily.members || []).some((m) => m.id === memberId);
        if (memberExists) {
          updateData.checked_by = memberId;
        }
      } else if (!newChecked) {
        updateData.checked_by = null;
      }

      const updated = await strapi.entityService.update(
        'api::list-item.list-item',
        item.id,
        {
          data: updateData,
          populate: ['family', 'list', 'created_by', 'checked_by'],
        }
      );

      return ctx.send({
        data: updated,
        message: updated.is_checked ? 'Élément coché' : 'Élément décoché',
      });
    } catch (error) {
      strapi.log.error('Erreur toggle list-item:', error);
      return ctx.internalServerError('Erreur lors du changement d\'état');
    }
  },

  /**
   * Modifier le nom par documentId
   */
  async update(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const { documentId } = ctx.params;
      const body = ctx.request.body?.data ?? ctx.request.body ?? {};
      const { name } = body;

      if (!documentId || typeof documentId !== 'string') {
        return ctx.badRequest('documentId requis');
      }
      if (!name || !String(name).trim()) {
        return ctx.badRequest('Le nom est requis');
      }

      const items = await resolveItemByDocumentId(strapi, documentId);
      if (!items || items.length === 0) {
        return ctx.notFound('Élément non trouvé');
      }

      const item = items[0];
      const family = await strapi.entityService.findMany('api::family.family', {
        filters: { users_permissions_user: { id: user.id } },
        limit: 1,
      });
      if (!family || family.length === 0) {
        return ctx.forbidden('Vous n\'appartenez à aucune famille');
      }
      const userFamily = family[0];
      const itemFamilyId = typeof item.family === 'object' ? item.family.id : item.family;
      if (itemFamilyId !== userFamily.id) {
        return ctx.forbidden('Cet élément n\'appartient pas à votre famille');
      }

      const updated = await strapi.entityService.update(
        'api::list-item.list-item',
        item.id,
        {
          data: { name: String(name).trim() },
          populate: ['family', 'list', 'created_by', 'checked_by'],
        }
      );

      return ctx.send({ data: updated });
    } catch (error) {
      strapi.log.error('Erreur mise à jour list-item:', error);
      return ctx.internalServerError('Erreur lors de la modification');
    }
  },

  /**
   * Supprimer par documentId
   */
  async delete(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const { documentId } = ctx.params;
      if (!documentId || typeof documentId !== 'string') {
        return ctx.badRequest('documentId requis');
      }

      const items = await resolveItemByDocumentId(strapi, documentId);
      if (!items || items.length === 0) {
        return ctx.notFound('Élément non trouvé');
      }

      const item = items[0];
      const family = await strapi.entityService.findMany('api::family.family', {
        filters: { users_permissions_user: { id: user.id } },
        limit: 1,
      });
      if (!family || family.length === 0) {
        return ctx.forbidden('Vous n\'appartenez à aucune famille');
      }
      const userFamily = family[0];
      const itemFamilyId = typeof item.family === 'object' ? item.family.id : item.family;
      if (itemFamilyId !== userFamily.id) {
        return ctx.forbidden('Cet élément n\'appartient pas à votre famille');
      }

      await strapi.entityService.delete('api::list-item.list-item', item.id);
      return ctx.send({ data: null });
    } catch (error) {
      strapi.log.error('Erreur suppression list-item:', error);
      return ctx.internalServerError('Erreur lors de la suppression');
    }
  },
}));
