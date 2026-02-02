'use strict';

/**
 * dish-rating service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::dish-rating.dish-rating');
