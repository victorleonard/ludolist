'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::random-pick-result.random-pick-result', ({ strapi }) => ({
  /**
   * List random pick results for the current user's family.
   * GET /api/random-pick-results
   */
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Vous devez être connecté');
    }

    try {
      const families = await strapi.entityService.findMany('api::family.family', {
        filters: { users_permissions_user: { id: user.id } },
        limit: 1,
      });
      const family = Array.isArray(families) ? families[0] : null;
      if (!family) {
        return ctx.forbidden("Vous n'appartenez à aucune famille");
      }

      const results = await strapi.entityService.findMany('api::random-pick-result.random-pick-result', {
        filters: { family: { id: family.id } },
        populate: { winner: true, family: true },
        sort: { drawn_at: 'desc' },
        limit: 50,
      });

      return { data: results };
    } catch (err) {
      strapi.log.error('Error listing random pick results:', err);
      return ctx.internalServerError('Erreur lors de la récupération de l’historique');
    }
  },

  /**
   * Create a random pick result.
   * POST /api/random-pick-results/create
   * Body: { winnerDocumentId, label?, participantDocumentIds? }
   */
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Vous devez être connecté');
    }

    const body = ctx.request.body?.data ?? ctx.request.body;
    const { winnerDocumentId, label, participantDocumentIds } = body ?? {};

    if (!winnerDocumentId) {
      return ctx.badRequest('winnerDocumentId is required');
    }

    try {
      const families = await strapi.entityService.findMany('api::family.family', {
        filters: { users_permissions_user: { id: user.id } },
        populate: { members: true },
        limit: 1,
      });
      const family = Array.isArray(families) ? families[0] : null;
      if (!family) {
        return ctx.forbidden("Vous n'appartenez à aucune famille");
      }

      const memberExists = (family.members || []).some(
        (m) => String(m.documentId ?? m.id) === String(winnerDocumentId)
      );
      if (!memberExists) {
        return ctx.forbidden("Le membre gagnant n'appartient pas à votre famille");
      }

      let winnerMember = null;
      const idNum = Number(winnerDocumentId);
      const isNumericId = !Number.isNaN(idNum) && String(idNum) === String(winnerDocumentId);
      if (isNumericId) {
        const byId = await strapi.entityService.findMany('api::member.member', {
          filters: { id: idNum },
          limit: 1,
        });
        winnerMember = Array.isArray(byId) ? byId[0] : null;
      } else {
        const byDocId = await strapi.entityService.findMany('api::member.member', {
          filters: { documentId: winnerDocumentId },
          limit: 1,
        });
        winnerMember = Array.isArray(byDocId) ? byDocId[0] : null;
      }
      if (!winnerMember) {
        return ctx.notFound('Membre non trouvé');
      }

      const created = await strapi.entityService.create('api::random-pick-result.random-pick-result', {
        data: {
          family: family.id,
          winner: winnerMember.id,
          drawn_at: new Date().toISOString(),
          label: label ?? null,
          participant_document_ids: Array.isArray(participantDocumentIds) ? participantDocumentIds : null,
        },
      });

      const withPopulate = await strapi.entityService.findOne(
        'api::random-pick-result.random-pick-result',
        created.id,
        { populate: { winner: true, family: true } }
      );

      return { data: withPopulate };
    } catch (err) {
      strapi.log.error('Error creating random pick result:', err);
      return ctx.internalServerError('Erreur lors de l’enregistrement du tirage');
    }
  },

  /**
   * Delete a random pick result (must belong to user's family).
   * DELETE /api/random-pick-results/:documentId
   */
  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Vous devez être connecté');
    }

    const documentId = ctx.params.documentId;
    if (!documentId) {
      return ctx.badRequest('documentId is required');
    }

    try {
      const families = await strapi.entityService.findMany('api::family.family', {
        filters: { users_permissions_user: { id: user.id } },
        limit: 1,
      });
      const family = Array.isArray(families) ? families[0] : null;
      if (!family) {
        return ctx.forbidden("Vous n'appartenez à aucune famille");
      }

      const idNum = Number(documentId);
      const isNumeric = !Number.isNaN(idNum) && String(idNum) === String(documentId);
      const results = await strapi.entityService.findMany('api::random-pick-result.random-pick-result', {
        filters: isNumeric ? { id: idNum } : { documentId },
        populate: { family: true },
        limit: 1,
      });
      const result = Array.isArray(results) ? results[0] : null;
      if (!result) {
        return ctx.notFound('Tirage non trouvé');
      }

      const resultFamilyId = result.family?.id ?? result.family;
      if (resultFamilyId !== family.id) {
        return ctx.forbidden('Ce tirage n’appartient pas à votre famille');
      }

      await strapi.entityService.delete('api::random-pick-result.random-pick-result', result.id);
      return { data: { success: true } };
    } catch (err) {
      strapi.log.error('Error deleting random pick result:', err);
      return ctx.internalServerError('Erreur lors de la suppression');
    }
  },
}));
