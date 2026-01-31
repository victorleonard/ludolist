'use strict';

/**
 * family controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::family.family', ({ strapi }) => ({
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
                    ratings: {
                      populate: ['member']
                    }
                  }
                },
                books: {
                  populate: {
                    image: true,
                    book_readings: {
                      populate: {
                        member: true
                      }
                    }
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
