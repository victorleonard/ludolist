'use strict';

/**
 * subscription controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::subscription.subscription', ({ strapi }) => ({
  /**
   * Lister tous les abonnements de la famille
   */
  async find(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const family = await strapi.entityService.findMany('api::family.family', {
        filters: { users_permissions_user: { id: user.id } },
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.forbidden('Vous n\'appartenez à aucune famille');
      }

      const userFamily = family[0];

      const subscriptions = await strapi.entityService.findMany('api::subscription.subscription', {
        filters: { family: { id: userFamily.id } },
        populate: ['paid_by', 'family'],
        sort: { name: 'asc' },
      });

      return { data: subscriptions };
    } catch (error) {
      strapi.log.error('Erreur lors de la récupération des abonnements:', error);
      return ctx.internalServerError('Erreur lors de la récupération des abonnements');
    }
  },

  /**
   * Récupérer un abonnement par documentId (avec vérification famille)
   */
  async findOne(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const family = await strapi.entityService.findMany('api::family.family', {
        filters: { users_permissions_user: { id: user.id } },
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.forbidden('Vous n\'appartenez à aucune famille');
      }

      const userFamily = family[0];
      const { id } = ctx.params;

      if (!id || typeof id !== 'string') {
        return ctx.badRequest('documentId requis');
      }

      const byDocumentId = await strapi.entityService.findMany('api::subscription.subscription', {
        filters: { documentId: id },
        populate: { family: true },
        limit: 1,
      });

      if (!byDocumentId || byDocumentId.length === 0) {
        return ctx.notFound('Abonnement non trouvé');
      }

      const sub = byDocumentId[0];
      const subFamilyId = typeof sub.family === 'object' ? sub.family.id : sub.family;
      if (subFamilyId !== userFamily.id) {
        return ctx.forbidden('Cet abonnement n\'appartient pas à votre famille');
      }

      const withRelations = await strapi.entityService.findOne('api::subscription.subscription', sub.id, {
        populate: ['paid_by', 'family'],
      });

      return { data: withRelations };
    } catch (error) {
      strapi.log.error('Erreur lors de la récupération de l\'abonnement:', error);
      return ctx.internalServerError('Erreur lors de la récupération de l\'abonnement');
    }
  },

  /**
   * Créer un abonnement pour la famille de l'utilisateur
   */
  async addToFamily(ctx) {
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
        return ctx.notFound('Famille non trouvée');
      }

      const userFamily = family[0];
      const { name, amount, renewal_date, paid_by: paidById } = ctx.request.body;

      if (!name || !String(name).trim()) {
        return ctx.badRequest('Le nom est requis');
      }

      let paidByMemberId = null;
      if (paidById != null && paidById !== '') {
        const memberExists = userFamily.members?.some(
          (m) => m.id === paidById || m.id === Number(paidById) || m.documentId === paidById
        );
        if (!memberExists) {
          return ctx.badRequest('Le membre « qui paye » n\'appartient pas à votre famille');
        }
        const member = userFamily.members.find(
          (m) => m.id === paidById || m.id === Number(paidById) || m.documentId === paidById
        );
        paidByMemberId = member?.id ?? Number(paidById);
      }

      const subscriptionData = {
        name: String(name).trim(),
        amount: amount != null && amount !== '' ? Number(amount) : null,
        renewal_date: renewal_date || null,
        family: userFamily.id,
        ...(paidByMemberId != null && { paid_by: paidByMemberId }),
      };

      const created = await strapi.entityService.create('api::subscription.subscription', {
        data: subscriptionData,
      });

      const withRelations = await strapi.entityService.findOne('api::subscription.subscription', created.id, {
        populate: ['paid_by', 'family'],
      });

      return ctx.created({
        data: withRelations,
        message: 'Abonnement créé avec succès',
      });
    } catch (error) {
      strapi.log.error('Erreur lors de la création de l\'abonnement:', error);
      return ctx.internalServerError('Erreur lors de la création de l\'abonnement');
    }
  },

  /**
   * Modifier un abonnement
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
      const { id } = ctx.params;

      if (!id || typeof id !== 'string') {
        return ctx.badRequest('documentId requis');
      }

      const byDocumentId = await strapi.entityService.findMany('api::subscription.subscription', {
        filters: { documentId: id },
        populate: { family: true },
        limit: 1,
      });

      if (!byDocumentId || byDocumentId.length === 0) {
        return ctx.notFound('Abonnement non trouvé');
      }

      const sub = byDocumentId[0];
      const subFamilyId = typeof sub.family === 'object' ? sub.family.id : sub.family;
      if (subFamilyId !== userFamily.id) {
        return ctx.forbidden('Cet abonnement n\'appartient pas à votre famille');
      }

      const { name, amount, renewal_date, paid_by: paidById } = ctx.request.body;
      const updateData = {};

      if (name !== undefined) {
        if (!name || !String(name).trim()) {
          return ctx.badRequest('Le nom ne peut pas être vide');
        }
        updateData.name = String(name).trim();
      }

      if (amount !== undefined) {
        updateData.amount = amount != null && amount !== '' ? Number(amount) : null;
      }

      if (renewal_date !== undefined) {
        updateData.renewal_date = renewal_date || null;
      }

      if (paidById !== undefined) {
        if (paidById != null && paidById !== '') {
          const memberExists = userFamily.members?.some(
            (m) => m.id === paidById || m.id === Number(paidById) || m.documentId === paidById
          );
          if (!memberExists) {
            return ctx.badRequest('Le membre « qui paye » n\'appartient pas à votre famille');
          }
          const member = userFamily.members.find(
            (m) => m.id === paidById || m.id === Number(paidById) || m.documentId === paidById
          );
          updateData.paid_by = member?.id ?? Number(paidById);
        } else {
          updateData.paid_by = null;
        }
      }

      const updated = await strapi.entityService.update('api::subscription.subscription', sub.id, {
        data: updateData,
        populate: ['paid_by', 'family'],
      });

      return ctx.send({
        data: updated,
        message: 'Abonnement modifié avec succès',
      });
    } catch (error) {
      strapi.log.error('Erreur lors de la modification de l\'abonnement:', error);
      return ctx.internalServerError('Erreur lors de la modification de l\'abonnement');
    }
  },

  /**
   * Supprimer un abonnement
   */
  async delete(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const family = await strapi.entityService.findMany('api::family.family', {
        filters: { users_permissions_user: { id: user.id } },
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.forbidden('Vous n\'appartenez à aucune famille');
      }

      const userFamily = family[0];
      const { id } = ctx.params;

      if (!id || typeof id !== 'string') {
        return ctx.badRequest('documentId requis');
      }

      const byDocumentId = await strapi.entityService.findMany('api::subscription.subscription', {
        filters: { documentId: id },
        populate: { family: true },
        limit: 1,
      });

      if (!byDocumentId || byDocumentId.length === 0) {
        return ctx.notFound('Abonnement non trouvé');
      }

      const sub = byDocumentId[0];
      const subFamilyId = typeof sub.family === 'object' ? sub.family.id : sub.family;
      if (subFamilyId !== userFamily.id) {
        return ctx.forbidden('Cet abonnement n\'appartient pas à votre famille');
      }

      await strapi.entityService.delete('api::subscription.subscription', sub.id);

      return ctx.send({
        message: 'Abonnement supprimé avec succès',
      });
    } catch (error) {
      strapi.log.error('Erreur lors de la suppression de l\'abonnement:', error);
      return ctx.internalServerError('Erreur lors de la suppression');
    }
  },
}));
