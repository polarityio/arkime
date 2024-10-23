/*
 * Copyright (c) 2024, Polarity.io, Inc.
 */
const polarityRequest = require('./polarity-request');
const { ApiRequestError } = require('./errors');
const { getLogger } = require('./logger');
const { request } = require('../config/config');
const SUCCESS_CODES = [200];
const entityTemplateReplacementRegex = /{{entity}}/gi;

async function searchSessions(entity, options, fieldsAsString = '') {
  const Logger = getLogger();

  const requestOptions = createRequestOptions(entity, options, fieldsAsString);

  Logger.trace({ requestOptions }, 'Request Options');

  const apiResponse = await polarityRequest.request(requestOptions, options);

  Logger.trace({ apiResponse }, 'Lookup API Response');

  if (!SUCCESS_CODES.includes(apiResponse.statusCode)) {
    throw new ApiRequestError(
      `Unexpected status code ${apiResponse.statusCode} received when making request to the Arkime API`,
      {
        statusCode: apiResponse.statusCode,
        requestOptions: apiResponse.requestOptions
      }
    );
  }

  if (apiResponse.body.error && apiResponse.body.error.length > 0) {
    throw new ApiRequestError(apiResponse.body.error, {
      statusCode: apiResponse.statusCode,
      requestOptions: apiResponse.requestOptions
    });
  }

  return apiResponse.body;
}

function createRequestOptions(entity, options, fieldsAsString) {
  let requestOptions = {
    uri: `${options.url}api/sessions`,
    method: 'POST',
    auth: {
      username: options.username,
      password: options.password,
      sendImmediately: false
    },
    body: {
      expression: getExpression(entity, options),
      date: options.hoursBack
    }
  };

  if (fieldsAsString.length > 0) {
    requestOptions.body.fields = fieldsAsString;
  }

  return requestOptions;
}

function getExpression(entity, options) {
  if (entity.isIP) {
    return options.ipExpression.replace(entityTemplateReplacementRegex, entity.value);
  } else if (entity.isDomain) {
    return options.domainExpression.replace(entityTemplateReplacementRegex, entity.value);
  } else if (entity.isUrl) {
    return options.urlExpression.replace(entityTemplateReplacementRegex, entity.value);
  }
}

function getIndicatorType(entity) {
  if (entity.isDomain) {
    return 'host';
  }
  if (entity.isIP) {
    return 'address';
  }
  if (entity.isHash) {
    return 'file';
  }
  if (entity.isEmail) {
    return 'emailAddress';
  }
  if (entity.isURL) {
    return 'url';
  }
}

module.exports = {
  searchSessions,
  getExpression
};
