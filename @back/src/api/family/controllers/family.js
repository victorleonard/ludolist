'use strict';

/**
 * family controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::family.family', ({ strapi }) => ({
  /**
   * Update - l'utilisateur ne peut modifier que sa propre famille.
   * Pour les livres : on n'autorise que le retrait (nouveaux IDs = sous-ensemble des actuels).
   */
  async update(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Vous devez être connecté');
    }

    const familyId = ctx.params.documentId ?? ctx.params.id;
    if (!familyId) {
      return ctx.badRequest('Identifiant de la famille requis');
    }

    const userFamily = await strapi.entityService.findMany('api::family.family', {
      filters: { users_permissions_user: { id: user.id } },
      populate: { books: true },
      limit: 1,
    });

    if (!userFamily?.[0]) {
      return ctx.notFound('Famille non trouvée');
    }

    const userFamilyId = String(userFamily[0].documentId ?? userFamily[0].id);
    const targetId = String(familyId);

    if (userFamilyId !== targetId) {
      return ctx.forbidden("Vous ne pouvez modifier que votre propre famille");
    }

    const body = ctx.request.body?.data ?? ctx.request.body;
    const newBookIds = body?.books;
    if (Array.isArray(newBookIds)) {
      const currentIds = new Set(
        (userFamily[0].books ?? []).map((b) => String(b.documentId ?? b.id))
      );
      const allValid = newBookIds.every((id) =>
        currentIds.has(String(id))
      );
      if (!allValid) {
        return ctx.forbidden(
          "Vous ne pouvez retirer que des livres déjà dans votre famille"
        );
      }
    }

    return super.update(ctx);
  },

  /**
   * Create / Delete / Find - restrictions selon la config Strapi
   * Find et FindOne : l'utilisateur accède à sa famille via /families/me
   */
  async find(ctx) {
    return ctx.forbidden(
      "Utilisez l'endpoint /api/families/me pour accéder à votre famille"
    );
  },

  async findOne(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Vous devez être connecté');
    }

    const familyId = ctx.params.documentId ?? ctx.params.id;
    const userFamily = await strapi.entityService.findMany('api::family.family', {
      filters: { users_permissions_user: { id: user.id } },
      limit: 1,
    });

    if (!userFamily?.[0]) {
      return ctx.notFound('Famille non trouvée');
    }

    const userFamilyId = String(userFamily[0].documentId ?? userFamily[0].id);
    const targetId = String(familyId);

    if (userFamilyId !== targetId) {
      return ctx.forbidden("Vous ne pouvez accéder qu'à votre propre famille");
    }

    return super.findOne(ctx);
  },

  /**
   * Récupère la famille de l'utilisateur connecté
   */
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('Vous devez être connecté pour accéder à cette ressource');
    }

    try {
      // Récupérer l'utilisateur avec sa famille et ses relations
      const userWithFamily = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user.id,
        {
          populate: {
            family: {
              populate: {
                members: {
                  populate: {
                    book_readings: {
                      populate: {
                        book: {
                          populate: {
                            image: true
                          }
                        }
                      }
                    }
                  }
                },
                games: {
                  populate: {
                    image: true,
                    owner: true,
                    ratings: {
                      populate: ['member']
                    }
                  }
                },
                books: {
                  populate: {
                    image: true,
                    added_by: true,
                    owner: true,
                    book_readings: {
                      populate: {
                        member: true
                      }
                    },
                    ratings: {
                      populate: ['member']
                    }
                  }
                },
                dishes: {
                  populate: {
                    image: true,
                    ratings: {
                      populate: ['member']
                    }
                  }
                },
                shopping_list: {
                  populate: {
                    items: {
                      populate: {
                        created_by: true
                      }
                    }
                  }
                },
                grocery_items: {
                  populate: {
                    created_by: true
                  }
                },
                tasks: {
                  populate: {
                    created_by: true,
                    assigned_to: true
                  }
                }
              }
            }
          }
        }
      );

      if (!userWithFamily.family) {
        return ctx.notFound('Aucune famille trouvée pour cet utilisateur');
      }

      return { data: userWithFamily.family };
    } catch (err) {
      ctx.throw(500, err);
    }
  }
}));
