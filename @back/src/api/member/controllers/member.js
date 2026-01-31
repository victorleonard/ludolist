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
  }
}));
