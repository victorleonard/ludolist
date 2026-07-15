'use strict';

/**
 * list-category controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

async function getUserFamily(strapi, userId) {
  const family = await strapi.entityService.findMany('api::family.family', {
    filters: { users_permissions_user: { id: userId } },
    populate: { members: true },
    limit: 1,
  });
  return family?.[0] ?? null;
}

async function resolveListByDocumentId(strapi, documentId) {
  const lists = await strapi.entityService.findMany('api::list.list', {
    filters: { documentId },
    populate: { family: true, allowed_members: true },
    limit: 1,
  });
  return lists?.[0] ?? null;
}

function assertListAccess(list, userFamily, memberId) {
  const listFamilyId = typeof list.family === 'object' ? list.family.id : list.family;
  if (listFamilyId !== userFamily.id) {
    return { ok: false, status: 403, message: 'Cette liste n\'appartient pas à votre famille' };
  }
  const allowed = list.allowed_members || [];
  const allowedIds = allowed.map((m) => (typeof m === 'object' ? m.id : m));
  if (allowedIds.length > 0 && (memberId == null || !allowedIds.includes(memberId))) {
    return { ok: false, status: 403, message: 'Vous n\'avez pas accès à cette liste' };
  }
  return { ok: true };
}

async function resolveCategoryByDocumentId(strapi, documentId) {
  const categories = await strapi.entityService.findMany('api::list-category.list-category', {
    filters: { documentId },
    populate: { family: true, list: true },
    limit: 1,
  });
  return categories?.[0] ?? null;
}

module.exports = createCoreController('api::list-category.list-category', ({ strapi }) => ({
  /**
   * Créer une catégorie (body: listDocumentId, name)
   */
  async create(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('Vous devez être connecté');

      const userFamily = await getUserFamily(strapi, user.id);
      if (!userFamily) return ctx.forbidden('Vous n\'appartenez à aucune famille');

      const body = ctx.request.body?.data ?? ctx.request.body ?? {};
      const { listDocumentId, name } = body;
      const memberId = body.memberId != null ? Number(body.memberId) : null;

      if (!listDocumentId || typeof listDocumentId !== 'string') {
        return ctx.badRequest('listDocumentId requis');
      }
      if (!name || !String(name).trim()) {
        return ctx.badRequest('Le nom de la catégorie est requis');
      }

      const list = await resolveListByDocumentId(strapi, listDocumentId);
      if (!list) return ctx.notFound('Liste non trouvée');

      const access = assertListAccess(list, userFamily, memberId);
      if (!access.ok) return ctx[access.status === 403 ? 'forbidden' : 'badRequest'](access.message);

      const existingCategories = await strapi.entityService.findMany('api::list-category.list-category', {
        filters: { list: list.id },
        fields: ['position'],
      });
      const maxPosition = existingCategories.length
        ? Math.max(...existingCategories.map((c) => c.position ?? 0))
        : -1;

      const created = await strapi.entityService.create('api::list-category.list-category', {
        data: {
          name: String(name).trim(),
          position: maxPosition + 1,
          list: list.id,
          family: userFamily.id,
        },
      });

      const withRelations = await strapi.entityService.findOne(
        'api::list-category.list-category',
        created.id,
        { populate: ['list', 'family'] },
      );

      return ctx.created({ data: withRelations });
    } catch (error) {
      strapi.log.error('Erreur création list-category:', error);
      return ctx.internalServerError('Erreur lors de la création de la catégorie');
    }
  },

  /**
   * Renommer une catégorie par documentId
   */
  async update(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('Vous devez être connecté');

      const userFamily = await getUserFamily(strapi, user.id);
      if (!userFamily) return ctx.forbidden('Vous n\'appartenez à aucune famille');

      const { documentId } = ctx.params;
      const body = ctx.request.body?.data ?? ctx.request.body ?? {};
      const { name } = body;

      if (!documentId || typeof documentId !== 'string') {
        return ctx.badRequest('documentId requis');
      }
      if (!name || !String(name).trim()) {
        return ctx.badRequest('Le nom est requis');
      }

      const category = await resolveCategoryByDocumentId(strapi, documentId);
      if (!category) return ctx.notFound('Catégorie non trouvée');

      const categoryFamilyId = typeof category.family === 'object' ? category.family.id : category.family;
      if (categoryFamilyId !== userFamily.id) {
        return ctx.forbidden('Cette catégorie n\'appartient pas à votre famille');
      }

      const updated = await strapi.entityService.update(
        'api::list-category.list-category',
        category.id,
        {
          data: { name: String(name).trim() },
          populate: ['list', 'family'],
        },
      );

      return ctx.send({ data: updated });
    } catch (error) {
      strapi.log.error('Erreur mise à jour list-category:', error);
      return ctx.internalServerError('Erreur lors de la modification de la catégorie');
    }
  },

  /**
   * Supprimer une catégorie (les éléments restent sans catégorie)
   */
  async delete(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('Vous devez être connecté');

      const userFamily = await getUserFamily(strapi, user.id);
      if (!userFamily) return ctx.forbidden('Vous n\'appartenez à aucune famille');

      const { documentId } = ctx.params;
      if (!documentId || typeof documentId !== 'string') {
        return ctx.badRequest('documentId requis');
      }

      const category = await resolveCategoryByDocumentId(strapi, documentId);
      if (!category) return ctx.notFound('Catégorie non trouvée');

      const categoryFamilyId = typeof category.family === 'object' ? category.family.id : category.family;
      if (categoryFamilyId !== userFamily.id) {
        return ctx.forbidden('Cette catégorie n\'appartient pas à votre famille');
      }

      const items = await strapi.entityService.findMany('api::list-item.list-item', {
        filters: { category: category.id },
        fields: ['id'],
      });
      for (const item of items) {
        await strapi.entityService.update('api::list-item.list-item', item.id, {
          data: { category: null },
        });
      }

      await strapi.entityService.delete('api::list-category.list-category', category.id);
      return ctx.send({ data: null });
    } catch (error) {
      strapi.log.error('Erreur suppression list-category:', error);
      return ctx.internalServerError('Erreur lors de la suppression de la catégorie');
    }
  },

  /**
   * Réordonner les catégories (body: listDocumentId, orderedDocumentIds[])
   */
  async reorder(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('Vous devez être connecté');

      const userFamily = await getUserFamily(strapi, user.id);
      if (!userFamily) return ctx.forbidden('Vous n\'appartenez à aucune famille');

      const body = ctx.request.body?.data ?? ctx.request.body ?? {};
      const { listDocumentId, orderedDocumentIds } = body;
      const memberId = body.memberId != null ? Number(body.memberId) : null;

      if (!listDocumentId || typeof listDocumentId !== 'string') {
        return ctx.badRequest('listDocumentId requis');
      }
      if (!Array.isArray(orderedDocumentIds)) {
        return ctx.badRequest('orderedDocumentIds doit être un tableau');
      }

      const list = await resolveListByDocumentId(strapi, listDocumentId);
      if (!list) return ctx.notFound('Liste non trouvée');

      const access = assertListAccess(list, userFamily, memberId);
      if (!access.ok) return ctx.forbidden(access.message);

      for (let position = 0; position < orderedDocumentIds.length; position += 1) {
        const docId = orderedDocumentIds[position];
        if (!docId || typeof docId !== 'string') continue;
        const category = await resolveCategoryByDocumentId(strapi, docId);
        if (!category) continue;
        const categoryListId = typeof category.list === 'object' ? category.list.id : category.list;
        if (categoryListId !== list.id) continue;
        await strapi.entityService.update('api::list-category.list-category', category.id, {
          data: { position },
        });
      }

      return ctx.send({ data: { ok: true } });
    } catch (error) {
      strapi.log.error('Erreur reorder list-categories:', error);
      return ctx.internalServerError('Erreur lors du réordonnancement des catégories');
    }
  },
}));
