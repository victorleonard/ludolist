'use strict';

/**
 * grocery-item service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::grocery-item.grocery-item');
