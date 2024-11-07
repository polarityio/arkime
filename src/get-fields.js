const polarityRequest = require('./polarity-request');
const { ApiRequestError } = require('./errors');
const { getLogger } = require('./logger');
const SUCCESS_CODES = [200];

async function getFields(options) {
  const Logger = getLogger();

  const requestOptions = createRequestOptions(options);

  Logger.trace({ requestOptions }, 'Request Options');

  const apiResponse = await polarityRequest.request(requestOptions, options);

  Logger.trace({ apiResponse }, 'Lookup API Response');

  if (!SUCCESS_CODES.includes(apiResponse.statusCode)) {
    throw new ApiRequestError(
      `Unexpected status code ${apiResponse.statusCode} received when making request to the Arkime API to fetch fields`,
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

  if (!Array.isArray(apiResponse.body)) {
    throw new ApiRequestError(
      `Unexpected response from 'api/fields' endpoint.  Expected array of field values.`,
      {
        statusCode: apiResponse.statusCode,
        requestOptions,
        responseBody: apiResponse.body
      }
    );
  }

  return apiResponse.body;
}

function createRequestOptions(options) {
  const url = options.url.endsWith('/') ? options.url : `${options.url}/`;

  // Auth options are set in `polarity-request.js`
  let requestOptions = {
    uri: `${url}api/fields`,
    method: 'GET',
    qs: {
      array: true
    }
  };

  return requestOptions;
}

module.exports = {
  getFields
};
