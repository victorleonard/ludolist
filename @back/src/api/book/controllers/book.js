"use strict";

/**
 * book controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

/** Vérifie que le livre appartient à une famille de l'utilisateur connecté */
async function assertBookBelongsToUserFamily(strapi, ctx, bookIdOrDocumentId) {
  const user = ctx.state.user;
  if (!user) {
    ctx.unauthorized("Vous devez être connecté");
    return false;
  }

  const userFamily = await strapi.entityService.findMany("api::family.family", {
    filters: { users_permissions_user: { id: user.id } },
    populate: { books: true },
    limit: 1,
  });

  if (!userFamily?.[0]) {
    ctx.notFound("Famille non trouvée");
    return false;
  }

  const identifier = String(bookIdOrDocumentId);
  const bookBelongsToFamily = userFamily[0].books?.some(
    (b) =>
      String(b.id) === identifier || b.documentId === identifier
  );

  if (!bookBelongsToFamily) {
    ctx.forbidden("Ce livre n'appartient pas à votre famille");
    return false;
  }
  return true;
}

module.exports = createCoreController("api::book.book", ({ strapi }) => ({
  /**
   * Update - vérifier que le livre appartient à la famille de l'utilisateur
   */
  async update(ctx) {
    const documentId = ctx.params.documentId ?? ctx.params.id;
    if (!documentId) {
      return ctx.badRequest("Identifiant du livre requis");
    }

    const ok = await assertBookBelongsToUserFamily(strapi, ctx, documentId);
    if (!ok) return;

    return super.update(ctx);
  },

  /**
   * Delete - vérifier que le livre appartient à la famille de l'utilisateur
   */
  async delete(ctx) {
    const documentId = ctx.params.documentId ?? ctx.params.id;
    if (!documentId) {
      return ctx.badRequest("Identifiant du livre requis");
    }

    const ok = await assertBookBelongsToUserFamily(strapi, ctx, documentId);
    if (!ok) return;

    return super.delete(ctx);
  },

  /**
   * Find / FindOne - désactiver l'accès direct aux livres (tout passe par la famille)
   */
  async find(ctx) {
    ctx.forbidden(
      "Utilisez l'endpoint /api/families/me pour accéder aux livres de votre famille"
    );
  },

  async findOne(ctx) {
    const documentId = ctx.params.documentId ?? ctx.params.id;
    if (!documentId) {
      return ctx.badRequest("Identifiant du livre requis");
    }

    const ok = await assertBookBelongsToUserFamily(strapi, ctx, documentId);
    if (!ok) return;

    return super.findOne(ctx);
  },

  /**
   * Create - désactivé (utiliser add-to-family)
   */
  async create(ctx) {
    ctx.forbidden("Utilisez l'endpoint /api/books/add-to-family pour ajouter un livre");
  },

  /**
   * Ajouter un livre à la famille de l'utilisateur connecté
   */
  async addToFamily(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("Vous devez être connecté");
      }

      // Récupérer la famille de l'utilisateur
      const family = await strapi.entityService.findMany("api::family.family", {
        filters: {
          users_permissions_user: {
            id: user.id,
          },
        },
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.notFound("Famille non trouvée");
      }

      const userFamily = family[0];

      // Récupérer les données du livre depuis le body
      const {
        titre,
        auteur,
        description,
        isbn,
        annee,
        editeur,
        image_url,
        image,
        nombre_pages,
        sujets,
        open_library_key,
        memberId,
      } = ctx.request.body;

      if (!titre) {
        return ctx.badRequest("Le titre est requis");
      }

      // Si memberId fourni, vérifier que le membre appartient à la famille
      let addedByMemberId = null;
      if (memberId != null) {
        const familyWithMembers = await strapi.entityService.findOne(
          "api::family.family",
          userFamily.id,
          { populate: { members: true } }
        );
        const memberExists = familyWithMembers.members?.some(
          (m) => m.id === memberId || m.id === Number(memberId)
        );
        if (!memberExists) {
          return ctx.badRequest("Ce membre n'appartient pas à votre famille");
        }
        addedByMemberId = Number(memberId);
      }

      // Récupérer les catégories (sujets) depuis l'API Open Library si ISBN ou clé fourni
      let sujetsFromApi = sujets || null;
      const isbnTrimmed = isbn?.trim();
      const keyTrimmed = open_library_key?.trim();
      try {
        let workKey = null;
        if (keyTrimmed) {
          workKey = keyTrimmed.startsWith("/works/") ? keyTrimmed : `/works/${keyTrimmed}`;
        } else if (isbnTrimmed) {
          const isbnRes = await fetch(
            `https://openlibrary.org/isbn/${encodeURIComponent(isbnTrimmed)}.json`
          );
          if (isbnRes.ok) {
            const isbnData = await isbnRes.json();
            const works = isbnData.works;
            if (Array.isArray(works) && works.length > 0 && works[0].key) {
              workKey = works[0].key;
            }
          }
        }
        if (workKey) {
          const workRes = await fetch(
            `https://openlibrary.org${workKey}.json`
          );
          if (workRes.ok) {
            const workData = await workRes.json();
            if (Array.isArray(workData.subjects) && workData.subjects.length > 0) {
              sujetsFromApi = workData.subjects.slice(0, 10);
            }
          }
        }
      } catch (apiErr) {
        strapi.log.warn("Open Library API (catégories):", apiErr?.message || apiErr);
      }

      // Créer le livre
      const bookData = {
        titre: titre.trim(),
        auteur: auteur?.trim() || null,
        description: description?.trim() || null,
        isbn: isbnTrimmed || null,
        annee: annee || null,
        editeur: editeur?.trim() || null,
        image_url: image_url || null,
        ...(image != null && { image }),
        nombre_pages: nombre_pages || null,
        sujets: sujetsFromApi,
        open_library_key: keyTrimmed || null,
        publishedAt: new Date().toISOString(),
        ...(addedByMemberId != null && { added_by: addedByMemberId }),
        // Le propriétaire initial est la personne qui ajoute le livre
        ...(addedByMemberId != null && { owner: addedByMemberId }),
      };

      const createdBook = await strapi.entityService.create("api::book.book", {
        data: bookData,
      });

      // Associer le livre à la famille
      // Dans Strapi v5, utiliser documentId pour les relations many-to-many
      if (!createdBook.documentId) {
        strapi.log.warn("Le livre créé n'a pas de documentId, utilisation de l'id");
      }

      // Récupérer la famille avec ses livres actuels
      const freshFamily = await strapi.entityService.findOne(
        "api::family.family",
        userFamily.id,
        {
          populate: {
            books: true,
          },
        },
      );

      // Récupérer les documentIds des livres existants (ou les ids en fallback)
      const currentBookIdentifiers = freshFamily.books?.map((b) => {
        return b.documentId || b.id;
      }).filter(Boolean) || [];

      // Utiliser documentId en priorité, sinon id
      const newBookIdentifier = createdBook.documentId || createdBook.id;

      // Ajouter le nouveau livre à la liste s'il n'y est pas déjà
      if (!currentBookIdentifiers.includes(newBookIdentifier)) {
        await strapi.entityService.update("api::family.family", userFamily.id, {
          data: {
            books: [...currentBookIdentifiers, newBookIdentifier],
          },
        });
      } else {
        strapi.log.info("Le livre est déjà associé à la famille");
      }

      // Récupérer le livre créé avec ses relations
      const bookWithRelations = await strapi.entityService.findOne(
        "api::book.book",
        createdBook.id,
        {
          populate: {
            image: true,
            families: true,
          },
        },
      );

      return ctx.created({
        data: bookWithRelations,
        message: "Livre ajouté à la collection avec succès",
      });
    } catch (error) {
      strapi.log.error("Erreur lors de l'ajout du livre:", error);
      return ctx.internalServerError("Erreur lors de l'ajout du livre");
    }
  },

  /**
   * Changer le propriétaire d'un livre
   */
  async changeOwner(ctx) {
    try {
      const user = ctx.state.user;
      if (!user) {
        return ctx.unauthorized("Vous devez être connecté");
      }

      const { bookId, ownerId } = ctx.request.body;

      if (!bookId) {
        return ctx.badRequest("bookId est requis");
      }

      // ownerId peut être null (pour "Famille") ou un nombre (pour un membre spécifique)
      // Si ownerId est undefined, c'est une erreur
      if (ownerId === undefined) {
        return ctx.badRequest("ownerId doit être fourni (null pour 'Famille' ou un ID de membre)");
      }

      // Récupérer la famille de l'utilisateur
      const family = await strapi.entityService.findMany("api::family.family", {
        filters: {
          users_permissions_user: {
            id: user.id,
          },
        },
        populate: {
          members: true,
          books: true,
        },
        limit: 1,
      });

      if (!family || family.length === 0) {
        return ctx.notFound("Famille non trouvée");
      }

      const userFamily = family[0];

      // Si ownerId n'est pas null, vérifier que le membre appartient à la famille
      if (ownerId !== null) {
        const memberExists = userFamily.members?.some(
          (m) => m.id === ownerId || m.id === Number(ownerId)
        );
        if (!memberExists) {
          return ctx.badRequest("Ce membre n'appartient pas à votre famille");
        }
      }

      // Vérifier que le livre appartient à la famille
      const bookIdentifier = String(bookId);
      const bookBelongsToFamily = userFamily.books?.some(
        (b) => String(b.id) === bookIdentifier || b.documentId === bookIdentifier
      );
      if (!bookBelongsToFamily) {
        return ctx.badRequest("Ce livre n'appartient pas à votre famille");
      }

      // Trouver le livre par id ou documentId
      let book;
      if (typeof bookId === "number" || !isNaN(Number(bookId))) {
        book = await strapi.entityService.findOne("api::book.book", Number(bookId));
      } else {
        const books = await strapi.entityService.findMany("api::book.book", {
          filters: { documentId: bookId },
          limit: 1,
        });
        book = books?.[0];
      }

      if (!book) {
        return ctx.notFound("Livre non trouvé");
      }

      // Mettre à jour le propriétaire (null pour "Famille" ou un ID de membre)
      await strapi.entityService.update("api::book.book", book.id, {
        data: {
          owner: ownerId === null ? null : Number(ownerId),
        },
      });

      return ctx.send({
        message: "Propriétaire changé avec succès",
      });
    } catch (error) {
      strapi.log.error("Erreur lors du changement de propriétaire:", error);
      return ctx.internalServerError("Erreur lors du changement de propriétaire");
    }
  },
}));
