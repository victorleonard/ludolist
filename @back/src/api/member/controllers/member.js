'use strict';

/**
 * member controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::member.member', ({ strapi }) => ({
  /**
   * Authentifier un membre avec son code PIN
   */
  async login(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté en tant qu\'utilisateur');
      }

      const { code, memberId } = ctx.request.body;

      if (!code || code.length !== 4) {
        return ctx.badRequest('Le code doit contenir 4 chiffres');
      }

      if (!memberId) {
        return ctx.badRequest('L\'ID du membre est requis');
      }

      // Récupérer la famille de l'utilisateur
      const family = await strapi.entityService.findMany('api::family.family', {
        filters: {
          users_permissions_user: {
            id: user.id
          }
        },
        populate: {
          members: true
        },
        limit: 1
      });

      if (!family || family.length === 0) {
        return ctx.notFound('Famille non trouvée');
      }

      const userFamily = family[0];

      // Chercher le membre sélectionné dans la famille
      const selectedMember = userFamily.members?.find(m => m.id === memberId);

      if (!selectedMember) {
        return ctx.unauthorized('Membre non trouvé dans votre famille');
      }

      // Vérifier que le code correspond bien au membre sélectionné
      if (selectedMember.code !== code) {
        return ctx.unauthorized('Code incorrect pour ce membre');
      }

      const member = selectedMember;

      // Retourner les informations du membre (sans le code pour la sécurité)
      const memberData = {
        id: member.id,
        username: member.username,
        familyId: userFamily.id
      };

      return ctx.send({
        data: memberData,
        message: `Connecté en tant que ${member.username}`
      });
    } catch (error) {
      strapi.log.error('Erreur lors de l\'authentification du membre:', error);
      return ctx.internalServerError('Erreur lors de l\'authentification');
    }
  },

  /**
   * Récupère les paramètres d'un membre (le membre doit appartenir à la famille de l'utilisateur)
   */
  async getSettings(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const { id } = ctx.params;
      const memberId = parseInt(id, 10);

      const family = await strapi.entityService.findMany('api::family.family', {
        filters: { users_permissions_user: { id: user.id } },
        populate: { members: true },
        limit: 1
      });

      if (!family?.length) {
        return ctx.notFound('Famille non trouvée');
      }

      const memberInFamily = family[0].members?.find(m => m.id === memberId);
      if (!memberInFamily) {
        return ctx.forbidden('Membre non trouvé dans votre famille');
      }

      const member = await strapi.entityService.findOne('api::member.member', memberId, {
        fields: ['settings']
      });
      const settings = member?.settings || {};
      return ctx.send({ data: settings });
    } catch (error) {
      strapi.log.error('Erreur lors de la récupération des paramètres:', error);
      return ctx.internalServerError('Erreur serveur');
    }
  },

  /**
   * Met à jour les paramètres d'un membre (le membre doit appartenir à la famille de l'utilisateur)
   */
  async updateSettings(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const { id } = ctx.params;
      const memberId = parseInt(id, 10);
      const body = ctx.request.body || {};

      const family = await strapi.entityService.findMany('api::family.family', {
        filters: { users_permissions_user: { id: user.id } },
        populate: { members: true },
        limit: 1
      });

      if (!family?.length) {
        return ctx.notFound('Famille non trouvée');
      }

      const memberInFamily = family[0].members?.find(m => m.id === memberId);
      if (!memberInFamily) {
        return ctx.forbidden('Membre non trouvé dans votre famille');
      }

      const currentMember = await strapi.entityService.findOne('api::member.member', memberId, {
        fields: ['settings']
      });
      const currentSettings = currentMember?.settings || {};
      const mergedSettings = { ...currentSettings, ...body };

      const updated = await strapi.entityService.update('api::member.member', memberId, {
        data: { settings: mergedSettings }
      });

      return ctx.send({ data: updated.settings || {} });
    } catch (error) {
      strapi.log.error('Erreur lors de la mise à jour des paramètres:', error);
      return ctx.internalServerError('Erreur serveur');
    }
  },

  /**
   * Met à jour le statut admin d'un membre (réservé au propriétaire de la famille).
   * Body: { is_admin: true | false }
   */
  async setMemberAdmin(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const { id } = ctx.params;
      const memberId = parseInt(id, 10);
      if (Number.isNaN(memberId)) {
        return ctx.badRequest('ID membre invalide');
      }

      const body = ctx.request.body?.data ?? ctx.request.body;
      const isAdmin = body?.is_admin;
      if (typeof isAdmin !== 'boolean') {
        return ctx.badRequest('is_admin doit être un booléen');
      }

      const family = await strapi.entityService.findMany('api::family.family', {
        filters: { users_permissions_user: { id: user.id } },
        populate: { members: { fields: ['id'] } },
        limit: 1
      });

      if (!family?.length) {
        return ctx.notFound('Famille non trouvée');
      }

      const memberInFamily = family[0].members?.find(m => m.id === memberId);
      if (!memberInFamily) {
        return ctx.forbidden('Membre non trouvé dans votre famille');
      }

      const updated = await strapi.entityService.update('api::member.member', memberId, {
        data: { is_admin: isAdmin }
      });

      return ctx.send({ data: { id: updated.id, is_admin: updated.is_admin } });
    } catch (error) {
      strapi.log.error('Erreur lors de la mise à jour du statut admin:', error);
      return ctx.internalServerError('Erreur serveur');
    }
  }
}));
