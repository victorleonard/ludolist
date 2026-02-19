'use strict';

/**
 * list controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::list.list', ({ strapi }) => ({
  /**
   * Récupérer les listes visibles par l'utilisateur : famille + listes à accès restreint (allowed_members)
   */
  async getByFamily(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const family = await strapi.entityService.findMany('api::family.family', {
        filters: { users_permissions_user: { id: user.id } },
        populate: { members: true, lists: { populate: { items: { populate: { created_by: true, checked_by: true } }, allowed_members: true } } },
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.forbidden('Vous n\'appartenez à aucune famille');
      }

      const userFamily = family[0];
      const memberId = ctx.query.memberId ? Number(ctx.query.memberId) : null;

      // Filtrer : allowed_members vide = toute la famille ; sinon uniquement si le membre est dans allowed_members
      const allLists = userFamily.lists || [];
      const filtered = allLists.filter((list) => {
        const allowed = list.allowed_members || [];
        const allowedIds = allowed.map((m) => (typeof m === 'object' ? m.id : m));
        if (allowedIds.length === 0) return true; // Toute la famille
        return memberId != null && allowedIds.includes(memberId);
      });

      filtered.forEach((list) => {
        if (list.items && list.items.length > 0) {
          list.items.sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.id - b.id);
        }
      });

      return ctx.send({ data: filtered });
    } catch (error) {
      strapi.log.error('Erreur lors de la récupération des listes:', error);
      return ctx.internalServerError('Erreur lors de la récupération des listes');
    }
  },

  /**
   * Récupérer une liste par documentId (vérif famille + droit si personnelle)
   */
  async findOne(ctx) {
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
      const { documentId } = ctx.params;

      if (!documentId || typeof documentId !== 'string') {
        return ctx.badRequest('documentId requis');
      }

      const lists = await strapi.entityService.findMany('api::list.list', {
        filters: { documentId },
        populate: { family: true, allowed_members: true, items: { populate: { created_by: true, checked_by: true } } },
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

      const allowed = list.allowed_members || [];
      const allowedIds = allowed.map((m) => (typeof m === 'object' ? m.id : m));
      if (allowedIds.length > 0) {
        const memberId = ctx.query.memberId ? Number(ctx.query.memberId) : null;
        if (memberId == null || !allowedIds.includes(memberId)) {
          return ctx.forbidden('Vous n\'avez pas accès à cette liste');
        }
      }

      if (list.items && list.items.length > 0) {
        list.items.sort((a, b) => (a.position ?? 0) - (b.position ?? 0) || a.id - b.id);
      }

      return ctx.send({ data: list });
    } catch (error) {
      strapi.log.error('Erreur lors de la récupération de la liste:', error);
      return ctx.internalServerError('Erreur lors de la récupération de la liste');
    }
  },

  /**
   * Créer une liste (body: name, allowedMemberIds?: number[]). Vide = toute la famille.
   */
  async create(ctx) {
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
      const { name, allowedMemberIds } = body;

      if (!name || !String(name).trim()) {
        return ctx.badRequest('Le nom de la liste est requis');
      }

      let allowedIds = [];
      if (Array.isArray(allowedMemberIds) && allowedMemberIds.length > 0) {
        const familyMemberIds = (userFamily.members || []).map((m) => m.id);
        const invalid = allowedMemberIds.filter((id) => !familyMemberIds.includes(Number(id)));
        if (invalid.length > 0) {
          return ctx.badRequest('Certains membres n\'appartiennent pas à votre famille');
        }
        allowedIds = allowedMemberIds.map((id) => Number(id));
      }

      const created = await strapi.entityService.create('api::list.list', {
        data: {
          name: String(name).trim(),
          family: userFamily.id,
          ...(allowedIds.length > 0 && { allowed_members: allowedIds }),
        },
      });

      const withRelations = await strapi.entityService.findOne('api::list.list', created.id, {
        populate: ['family', 'allowed_members', 'items'],
      });

      return ctx.created({ data: withRelations });
    } catch (error) {
      strapi.log.error('Erreur lors de la création de la liste:', error);
      return ctx.internalServerError('Erreur lors de la création de la liste');
    }
  },

  /**
   * Mettre à jour une liste (nom) par documentId
   */
  async update(ctx) {
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
      const { documentId } = ctx.params;
      const body = ctx.request.body?.data ?? ctx.request.body ?? {};
      const { name, allowedMemberIds } = body;

      if (!documentId || typeof documentId !== 'string') {
        return ctx.badRequest('documentId requis');
      }
      if (name !== undefined && (!String(name).trim())) {
        return ctx.badRequest('Le nom ne peut pas être vide');
      }

      const lists = await strapi.entityService.findMany('api::list.list', {
        filters: { documentId },
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

      const updateData = {};
      if (name !== undefined) updateData.name = String(name).trim();
      if (body.allowedMemberIds !== undefined) {
        if (!Array.isArray(body.allowedMemberIds)) {
          return ctx.badRequest('allowedMemberIds doit être un tableau');
        }
        const familyMemberIds = (userFamily.members || []).map((m) => m.id);
        const ids = body.allowedMemberIds.map((id) => Number(id));
        const invalid = ids.filter((id) => !familyMemberIds.includes(id));
        if (invalid.length > 0) {
          return ctx.badRequest('Certains membres n\'appartiennent pas à votre famille');
        }
        updateData.allowed_members = ids;
      }

      const updated = await strapi.entityService.update('api::list.list', list.id, {
        data: updateData,
        populate: ['family', 'allowed_members', 'items'],
      });

      return ctx.send({ data: updated });
    } catch (error) {
      strapi.log.error('Erreur lors de la mise à jour de la liste:', error);
      return ctx.internalServerError('Erreur lors de la mise à jour de la liste');
    }
  },

  /**
   * Supprimer une liste par documentId
   */
  async delete(ctx) {
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
      const { documentId } = ctx.params;
      const memberId = ctx.query.memberId ? Number(ctx.query.memberId) : null;

      if (!documentId || typeof documentId !== 'string') {
        return ctx.badRequest('documentId requis');
      }

      const lists = await strapi.entityService.findMany('api::list.list', {
        filters: { documentId },
        populate: { family: true, allowed_members: true, items: true },
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

      const allowed = list.allowed_members || [];
      const allowedIds = allowed.map((m) => (typeof m === 'object' ? m.id : m));
      if (allowedIds.length > 0 && (memberId == null || !allowedIds.includes(memberId))) {
        return ctx.forbidden('Vous ne pouvez supprimer que les listes auxquelles vous avez accès');
      }

      const itemIds = (list.items || []).map((i) => (typeof i === 'object' ? i.id : i));
      for (const itemId of itemIds) {
        await strapi.entityService.delete('api::list-item.list-item', itemId);
      }
      await strapi.entityService.delete('api::list.list', list.id);

      return ctx.send({ data: null });
    } catch (error) {
      strapi.log.error('Erreur lors de la suppression de la liste:', error);
      return ctx.internalServerError('Erreur lors de la suppression de la liste');
    }
  },
}));
