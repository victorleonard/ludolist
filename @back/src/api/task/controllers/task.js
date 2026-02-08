'use strict';

/**
 * task controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::task.task', ({ strapi }) => ({
  /**
   * Lister toutes les tâches de la famille (filtrées automatiquement)
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

      // Filtrer uniquement les tâches de la famille
      const tasks = await strapi.entityService.findMany('api::task.task', {
        filters: { family: { id: userFamily.id } },
        populate: ['created_by', 'assigned_to', 'family'],
        sort: { createdAt: 'desc' },
      });

      return { data: tasks };
    } catch (error) {
      strapi.log.error('Erreur lors de la récupération des tâches:', error);
      return ctx.internalServerError('Erreur lors de la récupération des tâches');
    }
  },

  /**
   * Récupérer une tâche par documentId (avec vérification famille)
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
      const { id } = ctx.params; // documentId uniquement

      if (!id || typeof id !== 'string') {
        return ctx.badRequest('documentId requis');
      }

      // Résoudre la tâche uniquement par documentId
      const tasksByDocumentId = await strapi.entityService.findMany('api::task.task', {
        filters: { documentId: id },
        populate: { family: true },
        limit: 1,
      });

      if (!tasksByDocumentId || tasksByDocumentId.length === 0) {
        return ctx.notFound('Tâche non trouvée');
      }

      const task = tasksByDocumentId[0];

      // Vérifier l'appartenance à la famille
      const taskFamilyId = typeof task.family === 'object' ? task.family.id : task.family;
      if (taskFamilyId !== userFamily.id) {
        return ctx.forbidden('Cette tâche n\'appartient pas à votre famille');
      }

      // Retourner la tâche avec ses relations populées
      const taskWithRelations = await strapi.entityService.findOne('api::task.task', task.id, {
        populate: ['created_by', 'assigned_to', 'family'],
      });

      return { data: taskWithRelations };
    } catch (error) {
      strapi.log.error('Erreur lors de la récupération de la tâche:', error);
      return ctx.internalServerError('Erreur lors de la récupération de la tâche');
    }
  },

  /**
   * Créer une tâche pour la famille de l'utilisateur
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
          members: true,
        },
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.notFound('Famille non trouvée');
      }

      const userFamily = family[0];
      const {
        title,
        description,
        priority,
        due_date,
        memberId,
        assigned_to,
      } = ctx.request.body;

      if (!title || !title.trim()) {
        return ctx.badRequest('Le titre est requis');
      }

      // Vérifier que memberId (créateur) appartient à la famille si fourni
      let createdByMemberId = null;
      if (memberId != null) {
        const memberExists = userFamily.members?.some(
          (m) => m.id === memberId || m.id === Number(memberId)
        );
        if (!memberExists) {
          return ctx.badRequest("Ce membre n'appartient pas à votre famille");
        }
        createdByMemberId = Number(memberId);
      }

      // Vérifier que assigned_to (membre assigné) appartient à la famille si fourni
      let assignedToMemberId = null;
      if (assigned_to != null) {
        const memberExists = userFamily.members?.some(
          (m) => m.id === assigned_to || m.id === Number(assigned_to)
        );
        if (!memberExists) {
          return ctx.badRequest("Le membre assigné n'appartient pas à votre famille");
        }
        assignedToMemberId = Number(assigned_to);
      }

      // Créer la tâche
      const taskData = {
        title: title.trim(),
        description: description?.trim() || null,
        priority: priority || 'medium',
        due_date: due_date || null,
        family: userFamily.id,
        is_completed: false,
        ...(createdByMemberId != null && { created_by: createdByMemberId }),
        ...(assignedToMemberId != null && { assigned_to: assignedToMemberId }),
      };

      const createdTask = await strapi.entityService.create('api::task.task', {
        data: taskData,
      });

      // Récupérer la tâche créée avec ses relations
      const taskWithRelations = await strapi.entityService.findOne('api::task.task', createdTask.id, {
        populate: {
          created_by: true,
          assigned_to: true,
          family: true,
        },
      });

      return ctx.created({
        data: taskWithRelations,
        message: 'Tâche créée avec succès',
      });
    } catch (error) {
      strapi.log.error('Erreur lors de la création de la tâche:', error);
      return ctx.internalServerError('Erreur lors de la création de la tâche');
    }
  },

  /**
   * Modifier une tâche
   */
  async update(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      // Récupérer la famille de l'utilisateur
      const family = await strapi.entityService.findMany('api::family.family', {
        filters: { users_permissions_user: { id: user.id } },
        populate: { members: true },
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.forbidden('Vous n\'appartenez à aucune famille');
      }

      const userFamily = family[0];

      // Résoudre la tâche UNIQUEMENT par documentId
      const { id } = ctx.params; // documentId uniquement

      if (!id || typeof id !== 'string') {
        return ctx.badRequest('documentId requis');
      }

      const tasksByDocumentId = await strapi.entityService.findMany('api::task.task', {
        filters: { documentId: id },
        populate: { family: true },
        limit: 1,
      });

      if (!tasksByDocumentId || tasksByDocumentId.length === 0) {
        return ctx.notFound('Tâche non trouvée');
      }

      const task = tasksByDocumentId[0];
      const taskNumericId = task.id; // Utilisé uniquement en interne pour Strapi

      // Vérifier l'appartenance à la famille
      const taskFamilyId = typeof task.family === 'object' ? task.family.id : task.family;
      if (taskFamilyId !== userFamily.id) {
        return ctx.forbidden('Cette tâche n\'appartient pas à votre famille');
      }

      // Récupérer les données à mettre à jour
      const {
        title,
        description,
        priority,
        due_date,
        assigned_to,
      } = ctx.request.body;

      // Construire l'objet de mise à jour
      const updateData = {};

      if (title !== undefined) {
        if (!title || !title.trim()) {
          return ctx.badRequest('Le titre ne peut pas être vide');
        }
        updateData.title = title.trim();
      }

      if (description !== undefined) {
        updateData.description = description?.trim() || null;
      }

      if (priority !== undefined) {
        if (!['low', 'medium', 'high', 'urgent'].includes(priority)) {
          return ctx.badRequest('Priorité invalide');
        }
        updateData.priority = priority;
      }

      if (due_date !== undefined) {
        updateData.due_date = due_date || null;
      }

      // Si assigned_to est modifié, vérifier qu'il appartient à la famille
      if (assigned_to !== undefined) {
        if (assigned_to !== null) {
          const memberExists = userFamily.members?.some(
            (m) => m.id === assigned_to || m.id === Number(assigned_to)
          );
          if (!memberExists) {
            return ctx.badRequest('Le membre assigné n\'appartient pas à votre famille');
          }
          updateData.assigned_to = Number(assigned_to);
        } else {
          updateData.assigned_to = null;
        }
      }

      // Effectuer la mise à jour
      const updatedTask = await strapi.entityService.update('api::task.task', taskNumericId, {
        data: updateData,
        populate: ['created_by', 'assigned_to', 'family'],
      });

      return ctx.send({
        data: updatedTask,
        message: 'Tâche modifiée avec succès',
      });
    } catch (error) {
      strapi.log.error('Erreur lors de la modification de la tâche:', error);
      return ctx.internalServerError('Erreur lors de la modification de la tâche');
    }
  },

  /**
   * Basculer l'état de complétion d'une tâche
   */
  async toggleCompleted(ctx) {
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
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.forbidden('Vous n\'appartenez à aucune famille');
      }

      const userFamily = family[0];
      const { id } = ctx.params; // documentId uniquement

      if (!id || typeof id !== 'string') {
        return ctx.badRequest('documentId requis');
      }

      // Résoudre la tâche uniquement par documentId
      const tasksByDocumentId = await strapi.entityService.findMany('api::task.task', {
        filters: { documentId: id },
        populate: { family: true },
        limit: 1,
      });

      if (!tasksByDocumentId || tasksByDocumentId.length === 0) {
        return ctx.notFound('Tâche non trouvée');
      }

      const task = tasksByDocumentId[0];
      const taskNumericId = task.id;

      // Vérifier que la tâche appartient à la famille de l'utilisateur
      const taskFamilyId = typeof task.family === 'object' ? task.family.id : task.family;

      if (!taskFamilyId || taskFamilyId !== userFamily.id) {
        return ctx.forbidden('Cette tâche n\'appartient pas à votre famille');
      }

      // Inverser l'état is_completed
      const updatedTask = await strapi.entityService.update('api::task.task', taskNumericId, {
        data: {
          is_completed: !task.is_completed,
        },
        populate: {
          created_by: true,
          assigned_to: true,
          family: true,
        },
      });

      return ctx.send({
        data: updatedTask,
        message: `Tâche ${updatedTask.is_completed ? 'marquée comme terminée' : 'marquée comme non terminée'}`,
      });
    } catch (error) {
      strapi.log.error('Erreur lors du changement d\'état de la tâche:', error);
      return ctx.internalServerError('Erreur lors du changement d\'état');
    }
  },

  /**
   * Supprimer une tâche
   */
  async delete(ctx) {
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
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.forbidden('Vous n\'appartenez à aucune famille');
      }

      const userFamily = family[0];
      const { id } = ctx.params; // documentId uniquement

      if (!id || typeof id !== 'string') {
        return ctx.badRequest('documentId requis');
      }

      // Résoudre la tâche uniquement par documentId
      const tasksByDocumentId = await strapi.entityService.findMany('api::task.task', {
        filters: { documentId: id },
        populate: { family: true },
        limit: 1,
      });

      if (!tasksByDocumentId || tasksByDocumentId.length === 0) {
        return ctx.notFound('Tâche non trouvée');
      }

      const task = tasksByDocumentId[0];
      const taskNumericId = task.id;

      // Vérifier que la tâche appartient à la famille de l'utilisateur
      const taskFamilyId = typeof task.family === 'object' ? task.family.id : task.family;

      if (!taskFamilyId || taskFamilyId !== userFamily.id) {
        return ctx.forbidden('Cette tâche n\'appartient pas à votre famille');
      }

      // Supprimer la tâche
      await strapi.entityService.delete('api::task.task', taskNumericId);

      return ctx.send({
        message: 'Tâche supprimée avec succès',
      });
    } catch (error) {
      strapi.log.error('Erreur lors de la suppression de la tâche:', error);
      return ctx.internalServerError('Erreur lors de la suppression');
    }
  },
}));
