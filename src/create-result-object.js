const { getLogger } = require('./logger');
const ipProtocolNumbers = require('./ip-protocol-numbers');
const { getExpression } = require('./search-sessions');
/**
 *
 * @param entity
 * @param apiResponse
 * @param fieldsAsArray array of all field objects which will be displayed in the "details" section of the details block
 * @param summaryFields array of field objects that should be displayed in the "summary" section of the details block
 * @param options
 * @returns {*[]}
 */
const createResultObjects = (
  entity,
  apiResponse,
  fieldsAsArray,
  summaryFields,
  options
) => {
  const lookupResults = [];

  apiResponse = formatData(apiResponse);

  if (apiResponse.data.length > 0) {
    // Add a synthetic index so we can display the session number even when using
    // paging in the component
    apiResponse.data.forEach((session, index) => {
      session.__index = index + 1;
      // session.id looks like this `3@241023-bzn5qw5A6TJBeJBeCriaaVVr` but when using the id in an expression we
      // need to drop the `@` sign and everything to the left of it.
      const tokens = session.id.split('@');
      const sessionId = tokens.length > 1 ? tokens[1] : '';
      if (sessionId) {
        session.__searchLink = `${options.url}sessions?expression=id${encodeURIComponent(
          '=='
        )}${sessionId}&startTime=${convertMillisecondsToSecondsRoundDown(
          session.firstPacket
        )}&stopTime=${convertMillisecondsToSecondsRoundUp(session.lastPacket)}`;
      }
    });

    lookupResults.push({
      entity,
      data: {
        summary: createSummary(apiResponse.data, options),
        details: {
          sessions: apiResponse.data,
          fields: fieldsAsArray,
          summaryFields,
          // This is the URL that will run the search within Arkime
          searchLink: `${options.url}sessions?expression=${getExpression(
            entity,
            options
          )}&date=${options.hoursBack}`
        }
      }
    });
  } else {
    lookupResults.push({
      entity,
      data: null
    });
  }

  return lookupResults;
};

function convertMillisecondsToSecondsRoundDown(milliseconds) {
  return Math.floor(milliseconds / 1000);
}

function convertMillisecondsToSecondsRoundUp(milliseconds) {
  return Math.ceil(milliseconds / 1000);
}

const formatData = (apiResponse) => {
  apiResponse.data.forEach((session) => {
    if (session.ipProtocol) {
      session.ipProtocolHumanized = ipProtocolNumbers[session.ipProtocol];
    }
  });

  return apiResponse;
};

/**
 * Creates the Summary Tags (currently just tags for ports)
 * @param match
 * @returns {string[]}
 */
const createSummary = (match, options) => {
  const tags = [];

  tags.push(`Results: ${match.length}`);

  return tags;
};

module.exports = {
  createResultObjects
};
