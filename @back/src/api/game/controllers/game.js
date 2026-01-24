'use strict';

/**
 * game controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::game.game', ({ strapi }) => ({
  /**
   * Recherche un jeu sur BoardGameGeek
   */
  async searchBGG(ctx) {
    try {
      const { query } = ctx.query;

      if (!query) {
        return ctx.badRequest('Le paramètre "query" est requis');
      }

      const bggToken = process.env.BGG_TOKEN;
      
      // URL de l'API BoardGameGeek XML API2
      const bggApiUrl = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame`;
      
      // Options pour la requête HTTP
      // L'API BGG nécessite un User-Agent valide
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml',
          'User-Agent': 'LudoList/1.0 (https://github.com/yourusername/ludolist)',
        },
      };
      
      // Ajouter le token Bearer dans le header Authorization
      if (bggToken) {
        fetchOptions.headers['Authorization'] = `Bearer ${bggToken}`;
        strapi.log.info('BGG_TOKEN utilisé comme Bearer token pour l\'authentification');
      } else {
        strapi.log.warn('BGG_TOKEN non défini dans les variables d\'environnement - tentative sans authentification');
      }

      // Faire la requête à l'API BoardGameGeek
      strapi.log.info(`Requête BGG: ${bggApiUrl}`);
      const response = await fetch(bggApiUrl, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();
        strapi.log.error(`Erreur BGG API: ${response.status} ${response.statusText}`, errorText);
        strapi.log.error(`Headers envoyés:`, JSON.stringify(fetchOptions.headers, null, 2));
        
        // Si erreur 401 et pas de token, suggérer de définir le token
        if (response.status === 401 && !bggToken) {
          return ctx.badRequest('Authentification requise: BGG_TOKEN doit être défini dans les variables d\'environnement');
        }
        
        return ctx.badRequest(`Erreur lors de la recherche sur BoardGameGeek: ${response.status} ${response.statusText}`);
      }

      const xmlData = await response.text();

      // Parser le XML de manière basique pour extraire les informations principales
      const games = [];
      const itemRegex = /<item[^>]*id="(\d+)"[^>]*>([\s\S]*?)<\/item>/g;
      let match;

      while ((match = itemRegex.exec(xmlData)) !== null) {
        const id = match[1];
        const itemContent = match[2];
        
        // Extraire le nom principal
        const nameMatch = itemContent.match(/<name[^>]*type="primary"[^>]*value="([^"]*)"/);
        const name = nameMatch ? nameMatch[1] : null;
        
        // Extraire l'année de publication
        const yearMatch = itemContent.match(/<yearpublished[^>]*value="([^"]*)"/);
        const year = yearMatch ? yearMatch[1] : null;

        if (name) {
          games.push({
            id: parseInt(id),
            name,
            year: year ? parseInt(year) : null,
            bggId: id,
          });
        }
      }

      return {
        data: {
          query,
          count: games.length,
          games,
        },
      };
    } catch (err) {
      strapi.log.error('Erreur lors de la recherche BGG:', err);
      ctx.throw(500, `Erreur lors de la recherche: ${err.message}`);
    }
  },

  /**
   * Récupère les détails d'un jeu BoardGameGeek par son ID (incluant l'image)
   */
  async getBGGDetails(ctx) {
    try {
      const { bggId } = ctx.params;

      if (!bggId) {
        return ctx.badRequest('Le paramètre "bggId" est requis');
      }

      const bggToken = process.env.BGG_TOKEN;
      
      // URL de l'API BoardGameGeek XML API2 pour récupérer les détails d'un jeu
      const bggApiUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${encodeURIComponent(bggId)}&stats=1`;
      
      // Options pour la requête HTTP
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Accept': 'application/xml, text/xml',
          'User-Agent': 'LudoList/1.0 (https://github.com/yourusername/ludolist)',
        },
      };
      
      // Ajouter le token Bearer dans le header Authorization
      if (bggToken) {
        fetchOptions.headers['Authorization'] = `Bearer ${bggToken}`;
      }

      // Faire la requête à l'API BoardGameGeek
      const response = await fetch(bggApiUrl, fetchOptions);

      if (!response.ok) {
        const errorText = await response.text();
        strapi.log.error(`Erreur BGG API: ${response.status} ${response.statusText}`, errorText);
        return ctx.badRequest(`Erreur lors de la récupération des détails: ${response.status} ${response.statusText}`);
      }

      const xmlData = await response.text();

      // Parser le XML pour extraire les détails du jeu
      const itemMatch = xmlData.match(/<item[^>]*type="boardgame"[^>]*>([\s\S]*?)<\/item>/);
      
      if (!itemMatch) {
        return ctx.notFound('Jeu non trouvé');
      }

      const itemContent = itemMatch[1];
      
      // Extraire le nom principal
      const nameMatch = itemContent.match(/<name[^>]*type="primary"[^>]*value="([^"]*)"/);
      const name = nameMatch ? nameMatch[1] : null;
      
      // Extraire l'année de publication
      const yearMatch = itemContent.match(/<yearpublished[^>]*value="([^"]*)"/);
      const year = yearMatch ? yearMatch[1] : null;
      
      // Extraire l'image
      const imageMatch = itemContent.match(/<image[^>]*>([^<]*)<\/image>/);
      const image = imageMatch ? imageMatch[1].trim() : null;
      
      // Extraire la miniature (thumbnail)
      const thumbnailMatch = itemContent.match(/<thumbnail[^>]*>([^<]*)<\/thumbnail>/);
      const thumbnail = thumbnailMatch ? thumbnailMatch[1].trim() : null;
      
      // Extraire la description
      const descriptionMatch = itemContent.match(/<description[^>]*>([\s\S]*?)<\/description>/);
      const description = descriptionMatch ? descriptionMatch[1].trim().replace(/&quot;/g, '"').replace(/&#10;/g, '\n') : null;
      
      // Extraire les informations de joueurs
      const minPlayersMatch = itemContent.match(/<minplayers[^>]*value="([^"]*)"/);
      const maxPlayersMatch = itemContent.match(/<maxplayers[^>]*value="([^"]*)"/);
      const minPlayers = minPlayersMatch ? parseInt(minPlayersMatch[1]) : null;
      const maxPlayers = maxPlayersMatch ? parseInt(maxPlayersMatch[1]) : null;
      
      // Extraire le temps de jeu
      const minPlayTimeMatch = itemContent.match(/<minplaytime[^>]*value="([^"]*)"/);
      const maxPlayTimeMatch = itemContent.match(/<maxplaytime[^>]*value="([^"]*)"/);
      const minPlayTime = minPlayTimeMatch ? parseInt(minPlayTimeMatch[1]) : null;
      const maxPlayTime = maxPlayTimeMatch ? parseInt(maxPlayTimeMatch[1]) : null;
      
      // Extraire l'âge minimum
      const minAgeMatch = itemContent.match(/<minage[^>]*value="([^"]*)"/);
      const minAge = minAgeMatch ? parseInt(minAgeMatch[1]) : null;

      return {
        data: {
          id: parseInt(bggId),
          bggId,
          name,
          year: year ? parseInt(year) : null,
          image,
          image_url: thumbnail || image, // URL du thumbnail BGG (ou image si pas de thumbnail)
          description,
          minPlayers,
          maxPlayers,
          minPlayTime,
          maxPlayTime,
          minAge,
        },
      };
    } catch (err) {
      strapi.log.error('Erreur lors de la récupération des détails BGG:', err);
      ctx.throw(500, `Erreur lors de la récupération des détails: ${err.message}`);
    }
  },

  /**
   * Ajoute un jeu depuis BoardGameGeek à la bibliothèque et l'associe à la famille de l'utilisateur
   */
  async addFromBGG(ctx) {
    try {
      const user = ctx.state.user;

      if (!user) {
        return ctx.unauthorized('Vous devez être connecté pour ajouter un jeu');
      }

      // Récupérer les données du jeu depuis le body
      const {
        bggId,
        name,
        description,
        age_min,
        age_max,
        playing_time,
        player_min,
        player_max,
        image_url,
        year,
        type,
        rating_global,
        categories
      } = ctx.request.body;

      // Validation des champs obligatoires
      if (!name || !bggId) {
        return ctx.badRequest('Le nom et le bggId sont requis');
      }

      // Récupérer la famille de l'utilisateur
      const userWithFamily = await strapi.entityService.findOne(
        'plugin::users-permissions.user',
        user.id,
        {
          populate: {
            family: {
              populate: {
                games: {
                  fields: ['id', 'bggId']
                }
              }
            }
          }
        }
      );

      if (!userWithFamily.family) {
        return ctx.forbidden('Vous devez appartenir à une famille pour ajouter un jeu');
      }

      const family = userWithFamily.family;

      // Vérifier si le jeu n'existe pas déjà dans la famille
      const existingGame = family.games?.find(g => g.bggId === String(bggId));
      if (existingGame) {
        return ctx.badRequest('Ce jeu est déjà dans votre bibliothèque');
      }

      // Créer le jeu
      const gameData = {
        name: name.trim(),
        description: description || '',
        age_min: age_min ?? 0,
        age_max: age_max || null,
        playing_time: playing_time || '30',
        player_min: player_min ?? 2,
        player_max: player_max || null,
        image_url: image_url || null,
        bggId: String(bggId),
        year: year || null,
        type: type || null,
        rating_global: rating_global || null,
        categories: categories || null,
        publishedAt: new Date().toISOString()
      };

      const createdGame = await strapi.entityService.create('api::game.game', {
        data: gameData
      });

      // Associer le jeu à la famille
      // Dans Strapi v5, utiliser documentId pour les relations many-to-many
      if (!createdGame.documentId) {
        ctx.throw(500, 'Le jeu créé n\'a pas de documentId');
      }

      // Récupérer la famille avec ses jeux actuels
      const freshFamily = await strapi.entityService.findOne('api::family.family', family.id, {
        populate: {
          games: {
            fields: ['documentId']
          }
        }
      });

      const currentGameDocumentIds = freshFamily.games?.map(g => g.documentId).filter(Boolean) || [];
      
      // Ajouter le nouveau jeu à la liste s'il n'y est pas déjà
      if (!currentGameDocumentIds.includes(createdGame.documentId)) {
        await strapi.entityService.update('api::family.family', family.id, {
          data: {
            games: [...currentGameDocumentIds, createdGame.documentId]
          }
        });
      }

      // Récupérer le jeu créé avec ses relations
      const gameWithRelations = await strapi.entityService.findOne(
        'api::game.game',
        createdGame.id,
        {
          populate: {
            image: true,
            families: true
          }
        }
      );

      return {
        data: gameWithRelations,
        message: 'Jeu ajouté avec succès à votre bibliothèque'
      };
    } catch (err) {
      strapi.log.error('Erreur lors de l\'ajout du jeu depuis BGG:', err);
      ctx.throw(500, `Erreur lors de l'ajout du jeu: ${err.message}`);
    }
  },
}));
