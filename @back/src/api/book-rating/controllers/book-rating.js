'use strict';

/**
 * book-rating controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::book-rating.book-rating', ({ strapi }) => ({
  /**
   * Définir ou mettre à jour une note de manière sécurisée
   */
  async setRating(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Vous devez être connecté pour noter un livre');
    }

    const { bookId, memberId, rating } = ctx.request.body;

    // Validation des données
    if (!bookId || !memberId || rating === undefined || rating === null) {
      return ctx.badRequest('bookId, memberId et rating sont requis');
    }

    if (rating !== 0 && (rating < 1 || rating > 10)) {
      return ctx.badRequest('La note doit être entre 1 et 10, ou 0 pour supprimer');
    }

    try {
      // Récupérer la famille de l'utilisateur
      const family = await strapi.entityService.findMany('api::family.family', {
        filters: {
          users_permissions_user: {
            id: user.id
          }
        },
        populate: {
          members: true,
          books: true
        },
        limit: 1
      });

      if (!family || family.length === 0) {
        return ctx.forbidden('Vous devez appartenir à une famille pour noter un livre');
      }

      const userFamily = family[0];

      // Vérifier que le membre appartient à la famille
      const memberBelongsToFamily = userFamily.members?.some(m => 
        m.id === memberId || m.documentId === memberId
      );
      if (!memberBelongsToFamily) {
        return ctx.forbidden('Ce membre n\'appartient pas à votre famille');
      }

      // Vérifier que le livre appartient à la famille
      const bookIdNum = typeof bookId === 'string' ? parseInt(bookId, 10) : bookId;
      const bookBelongsToFamily = userFamily.books?.some(b => 
        b.id === bookId || b.id === bookIdNum || b.documentId === bookId
      );
      if (!bookBelongsToFamily) {
        return ctx.forbidden('Ce livre n\'appartient pas à votre famille');
      }

      // Trouver le livre pour obtenir son id numérique
      let bookIdForRelation = bookId;
      if (typeof bookId === 'string' && !bookId.match(/^\d+$/)) {
        const book = await strapi.entityService.findMany('api::book.book', {
          filters: {
            documentId: bookId
          },
          limit: 1
        });
        if (book && book.length > 0) {
          bookIdForRelation = book[0].id;
        } else {
          return ctx.notFound('Livre non trouvé');
        }
      } else {
        bookIdForRelation = typeof bookId === 'string' ? parseInt(bookId, 10) : bookId;
      }

      // Chercher si une note existe déjà
      const existingRatings = await strapi.entityService.findMany(
        'api::book-rating.book-rating',
        {
          filters: {
            book: { id: bookIdForRelation },
            member: { id: memberId },
            family: { id: userFamily.id }
          }
        }
      );

      let result;

      if (rating === 0) {
        // Supprimer la note si elle existe
        if (existingRatings && existingRatings.length > 0) {
          await strapi.entityService.delete(
            'api::book-rating.book-rating',
            existingRatings[0].id
          );
          return { data: null };
        }
        return { data: null };
      }

      if (existingRatings && existingRatings.length > 0) {
        // Mettre à jour la note existante
        result = await strapi.entityService.update(
          'api::book-rating.book-rating',
          existingRatings[0].id,
          {
            data: {
              rating
            },
            populate: ['member', 'book']
          }
        );
      } else {
        // Créer une nouvelle note
        result = await strapi.entityService.create(
          'api::book-rating.book-rating',
          {
            data: {
              rating,
              book: bookIdForRelation,
              member: memberId,
              family: userFamily.id
            },
            populate: ['member', 'book']
          }
        );
      }

      return { data: result };
    } catch (err) {
      strapi.log.error('Erreur lors de la définition de la note:', err);
      ctx.throw(500, 'Erreur lors de la définition de la note');
    }
  },

  /**
   * Récupérer les notes d'un livre de manière sécurisée
   */
  async getBookRatings(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Vous devez être connecté pour voir les notes');
    }

    const { bookId } = ctx.params;

    if (!bookId) {
      return ctx.badRequest('bookId est requis');
    }

    try {
      // Récupérer la famille de l'utilisateur
      const family = await strapi.entityService.findMany('api::family.family', {
        filters: {
          users_permissions_user: {
            id: user.id
          }
        },
        populate: {
          books: true
        },
        limit: 1
      });

      if (!family || family.length === 0) {
        return ctx.forbidden('Vous devez appartenir à une famille');
      }

      const userFamily = family[0];

      // Vérifier que le livre appartient à la famille
      const bookIdNum = typeof bookId === 'string' ? parseInt(bookId, 10) : bookId;
      const bookBelongsToFamily = userFamily.books?.some(b => 
        b.id === bookId || b.id === bookIdNum || b.documentId === bookId
      );
      if (!bookBelongsToFamily) {
        return ctx.forbidden('Ce livre n\'appartient pas à votre famille');
      }

      // Trouver le livre pour obtenir son id numérique
      let bookIdForFilter = bookId;
      if (typeof bookId === 'string' && !bookId.match(/^\d+$/)) {
        const book = await strapi.entityService.findMany('api::book.book', {
          filters: {
            documentId: bookId
          },
          limit: 1
        });
        if (book && book.length > 0) {
          bookIdForFilter = book[0].id;
        } else {
          return ctx.notFound('Livre non trouvé');
        }
      } else {
        bookIdForFilter = typeof bookId === 'string' ? parseInt(bookId, 10) : bookId;
      }

      // Récupérer les notes du livre
      const ratings = await strapi.entityService.findMany(
        'api::book-rating.book-rating',
        {
          filters: {
            book: { id: bookIdForFilter },
            family: { id: userFamily.id }
          },
          populate: ['member', 'book']
        }
      );

      return { data: ratings };
    } catch (err) {
      strapi.log.error('Erreur lors de la récupération des notes:', err);
      ctx.throw(500, 'Erreur lors de la récupération des notes');
    }
  }
}));
