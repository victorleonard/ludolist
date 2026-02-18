'use strict';

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::random-pick-result.random-pick-result');
