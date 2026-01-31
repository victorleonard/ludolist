'use strict';

/**
 * book-reading service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::book-reading.book-reading');
