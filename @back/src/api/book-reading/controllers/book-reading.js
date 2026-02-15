'use strict';

/**
 * book-reading controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::book-reading.book-reading', ({ strapi }) => ({
  /**
   * Créer ou mettre à jour une lecture de livre pour un membre
   */
  async upsert(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const { memberId, bookId, date_debut, date_fin, note, pages_lues, abandonne } = ctx.request.body;

      if (!memberId || !bookId) {
        return ctx.badRequest('memberId et bookId sont requis');
      }

      // Vérifier que le membre appartient à la famille de l'utilisateur
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
        return ctx.notFound('Famille non trouvée');
      }

      const userFamily = family[0];
      const memberExists = userFamily.members?.some(m => m.id === memberId || m.documentId === memberId);
      
      if (!memberExists) {
        return ctx.forbidden('Ce membre n\'appartient pas à votre famille');
      }

      // Vérifier que le livre appartient à la famille
      // Comparer à la fois id et documentId pour gérer les deux cas
      const bookExists = userFamily.books?.some(b => {
        const bookIdNum = typeof bookId === 'string' ? parseInt(bookId, 10) : bookId;
        return b.id === bookId || b.id === bookIdNum || b.documentId === bookId;
      });
      
      if (!bookExists) {
        strapi.log.warn(`Livre ${bookId} non trouvé dans la famille. Livres disponibles:`, 
          userFamily.books?.map(b => ({ id: b.id, documentId: b.documentId })));
        return ctx.forbidden('Ce livre n\'appartient pas à votre famille');
      }

      // Récupérer le livre pour obtenir son id numérique (nécessaire pour la relation)
      // Si bookId est un documentId, on doit trouver le livre correspondant
      let bookIdForRelation = bookId;
      if (typeof bookId === 'string' && !bookId.match(/^\d+$/)) {
        // C'est un documentId, trouver le livre correspondant
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
        // C'est déjà un id numérique
        bookIdForRelation = typeof bookId === 'string' ? parseInt(bookId, 10) : bookId;
      }

      // Chercher une lecture existante
      const existingReading = await strapi.entityService.findMany('api::book-reading.book-reading', {
        filters: {
          member: {
            id: memberId
          },
          book: {
            id: bookIdForRelation
          }
        },
        limit: 1
      });

      const existing = existingReading && existingReading.length > 0 ? existingReading[0] : null;
      const getExisting = (key) => existing && (existing[key] ?? existing.attributes?.[key]) != null
        ? (existing[key] ?? existing.attributes?.[key])
        : null;

      // Préserver les champs existants s'ils ne sont pas fournis dans la requête (mise à jour partielle)
      let dateDebutValue = null;
      if (date_debut !== undefined && date_debut !== null) {
        dateDebutValue = date_debut || null;
      } else if (existing) {
        dateDebutValue = getExisting('date_debut') || null;
      }

      let dateFinValue = null;
      if (date_fin !== undefined && date_fin !== null) {
        dateFinValue = date_fin || null;
      } else if (existing) {
        dateFinValue = getExisting('date_fin') || null;
      }

      let noteValue = null;
      if (note !== undefined && note !== null) {
        noteValue = parseFloat(note);
      } else if (existing) {
        const n = getExisting('note');
        noteValue = n != null ? parseFloat(n) : null;
      }

      let pagesLuesValue = null;
      if (pages_lues !== undefined && pages_lues !== null) {
        pagesLuesValue = parseInt(pages_lues, 10);
      } else if (existing) {
        const p = getExisting('pages_lues');
        pagesLuesValue = p != null ? parseInt(p, 10) : null;
      }

      let abandonneValue = false;
      if (abandonne !== undefined) {
        abandonneValue = Boolean(abandonne);
      } else if (existing) {
        const a = getExisting('abandonne');
        abandonneValue = a === true || a === 'true';
      }

      const readingData = {
        member: memberId,
        book: bookIdForRelation,
        date_debut: dateDebutValue,
        date_fin: dateFinValue,
        note: noteValue,
        pages_lues: pagesLuesValue,
        abandonne: abandonneValue
      };

      let reading;

      if (existingReading && existingReading.length > 0) {
        // Mettre à jour la lecture existante
        reading = await strapi.entityService.update(
          'api::book-reading.book-reading',
          existingReading[0].id,
          {
            data: readingData,
            populate: {
              member: true,
              book: {
                populate: {
                  image: true
                }
              }
            }
          }
        );
      } else {
        // Créer une nouvelle lecture
        reading = await strapi.entityService.create('api::book-reading.book-reading', {
          data: readingData,
          populate: {
            member: true,
            book: {
              populate: {
                image: true
              }
            }
          }
        });
      }

      return ctx.send({
        data: reading,
        message: existingReading && existingReading.length > 0 
          ? 'Lecture mise à jour avec succès' 
          : 'Lecture créée avec succès'
      });
    } catch (error) {
      strapi.log.error('Erreur lors de la création/mise à jour de la lecture:', error);
      return ctx.internalServerError('Erreur lors de la sauvegarde de la lecture');
    }
  },

  /**
   * Récupérer toutes les lectures d'un membre
   */
  async findByMember(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const { memberId } = ctx.params;

      // Vérifier que le membre appartient à la famille de l'utilisateur
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
      const memberIdNum = typeof memberId === 'string' ? parseInt(memberId, 10) : memberId;
      const memberExists = userFamily.members?.some(m => m.id === memberIdNum || m.id === memberId);
      
      if (!memberExists) {
        return ctx.forbidden('Ce membre n\'appartient pas à votre famille');
      }

      const readings = await strapi.entityService.findMany('api::book-reading.book-reading', {
        filters: {
          member: {
            id: memberIdNum
          }
        },
        populate: {
          member: true,
          book: {
            populate: {
              image: true
            }
          }
        },
        sort: { date_debut: 'desc' }
      });

      return ctx.send({ data: readings });
    } catch (error) {
      strapi.log.error('Erreur lors de la récupération des lectures:', error);
      return ctx.internalServerError('Erreur lors de la récupération des lectures');
    }
  },

  /**
   * Récupérer toutes les lectures d'un livre
   */
  async findByBook(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized('Vous devez être connecté');
      }

      const { bookId } = ctx.params;

      // Vérifier que le livre appartient à la famille de l'utilisateur
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
        return ctx.notFound('Famille non trouvée');
      }

      const userFamily = family[0];
      // Comparer à la fois id et documentId pour gérer les deux cas
      const bookIdNum = typeof bookId === 'string' ? parseInt(bookId, 10) : bookId;
      const bookExists = userFamily.books?.some(b => {
        return b.id === bookId || b.id === bookIdNum || b.documentId === bookId;
      });
      
      if (!bookExists) {
        strapi.log.warn(`Livre ${bookId} non trouvé dans la famille. Livres disponibles:`, 
          userFamily.books?.map(b => ({ id: b.id, documentId: b.documentId })));
        return ctx.forbidden('Ce livre n\'appartient pas à votre famille');
      }

      // Utiliser l'id numérique pour le filtre (obligatoire pour la relation Strapi)
      const bookIdForFilter = typeof bookId === 'string' && !Number.isNaN(bookIdNum)
        ? bookIdNum
        : (typeof bookId === 'number' ? bookId : bookIdNum);

      const readings = await strapi.entityService.findMany('api::book-reading.book-reading', {
        filters: {
          book: {
            id: bookIdForFilter
          }
        },
        populate: {
          member: true,
          book: {
            populate: {
              image: true
            }
          }
        },
        sort: { date_debut: 'desc' }
      });

      return ctx.send({ data: readings });
    } catch (error) {
      strapi.log.error('Erreur lors de la récupération des lectures:', error);
      return ctx.internalServerError('Erreur lors de la récupération des lectures');
    }
  },

  /**
   * Delete - vérifier que la lecture appartient à la famille de l'utilisateur
   * Utilise le Document Service API (Strapi 5) car la route REST envoie documentId
   */
  async delete(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Vous devez être connecté');
    }

    const documentId = ctx.params.documentId ?? ctx.params.id;
    if (!documentId) {
      return ctx.badRequest('Identifiant de la lecture requis');
    }

    const reading = await strapi.documents('api::book-reading.book-reading').findOne({
      documentId,
      populate: ['book', 'member']
    });

    if (!reading) {
      return ctx.notFound('Lecture non trouvée');
    }

    const family = await strapi.entityService.findMany('api::family.family', {
      filters: {
        users_permissions_user: { id: user.id }
      },
      populate: { members: true, books: true },
      limit: 1
    });

    if (!family || family.length === 0) {
      return ctx.notFound('Famille non trouvée');
    }

    const userFamily = family[0];
    const bookId = reading.book?.id ?? reading.book?.documentId ?? reading.book;
    const memberId = reading.member?.id ?? reading.member?.documentId ?? reading.member;

    const bookBelongsToFamily = userFamily.books?.some(
      b => b.id === bookId || b.documentId === String(bookId)
    );
    const memberBelongsToFamily = userFamily.members?.some(
      m => m.id === memberId || m.documentId === String(memberId)
    );

    if (!bookBelongsToFamily || !memberBelongsToFamily) {
      return ctx.forbidden("Cette lecture n'appartient pas à votre famille");
    }

    await strapi.documents('api::book-reading.book-reading').delete({ documentId });
    return ctx.send({ data: null });
  }
}));
