"use strict";

/**
 * book controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::book.book", ({ strapi }) => ({
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
        nombre_pages,
        sujets,
        open_library_key,
      } = ctx.request.body;

      if (!titre) {
        return ctx.badRequest("Le titre est requis");
      }

      // Créer le livre
      const bookData = {
        titre: titre.trim(),
        auteur: auteur?.trim() || null,
        description: description?.trim() || null,
        isbn: isbn?.trim() || null,
        annee: annee || null,
        editeur: editeur?.trim() || null,
        image_url: image_url || null,
        nombre_pages: nombre_pages || null,
        sujets: sujets || null,
        open_library_key: open_library_key || null,
        publishedAt: new Date().toISOString(),
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
}));
