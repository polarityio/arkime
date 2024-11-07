/*
 * Copyright (c) 2024, Polarity.io, Inc.
 */
const polarityRequest = require('./polarity-request');
const { ApiRequestError } = require('./errors');
const { getLogger } = require('./logger');
const SUCCESS_CODES = [200];
const entityTemplateReplacementRegex = /{{entity}}/gi;

async function searchSessions(entity, options, fieldsAsString = '') {
  const Logger = getLogger();

  const expression = getExpression(entity, options);

  if (!expression) {
    // if no expression is set we don't run a search and return an empty data result
    return {
      data: []
    };
  }

  const requestOptions = createRequestOptions(entity, options, fieldsAsString);

  Logger.trace({ requestOptions }, 'Request Options');

  const apiResponse = await polarityRequest.request(requestOptions, options);

  Logger.trace({ apiResponse }, 'Lookup API Response');

  if (!SUCCESS_CODES.includes(apiResponse.statusCode)) {
    throw new ApiRequestError(
      `Unexpected status code ${apiResponse.statusCode} received when making request to the Arkime API`,
      {
        statusCode: apiResponse.statusCode,
        requestOptions,
        responseBody: apiResponse.body
      }
    );
  }

  if (apiResponse.body.error && apiResponse.body.error.length > 0) {
    throw new ApiRequestError(apiResponse.body.error, {
      statusCode: apiResponse.statusCode,
      requestOptions,
      responseBody: apiResponse.body
    });
  }

  return apiResponse.body;
}

function createRequestOptions(entity, options, fieldsAsString) {
  // Auth options are set in `polarity-request.js`
  let requestOptions = {
    uri: `${options.url}api/sessions`,
    method: 'POST',
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
  if (entity.isIP && options.ipExpression.trim().length > 0) {
    return options.ipExpression
      .trim()
      .replace(entityTemplateReplacementRegex, entity.value);
  } else if (entity.isDomain && options.domainExpression.trim().length > 0) {
    return options.domainExpression
      .trim()
      .replace(entityTemplateReplacementRegex, entity.value);
  } else if (entity.isUrl && options.urlExpression.trim().length > 0) {
    return options.urlExpression
      .trim()
      .replace(entityTemplateReplacementRegex, entity.value);
  }

  return null;
}

module.exports = {
  searchSessions,
  getExpression
};
