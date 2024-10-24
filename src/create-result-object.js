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

  if (apiResponse && apiResponse.data.length > 0) {
    const sessions = [];
    // Add a synthetic index so we can display the session number even when using
    // paging in the component
    apiResponse.data.forEach((session, index) => {
      let resultObject = {
        session,
        __index: index,
        __count: index + 1
      };

      // session.id looks like this `3@241023-bzn5qw5A6TJBeJBeCriaaVVr` but when using the id in an expression we
      // need to drop the `@` sign and everything to the left of it.
      const tokens = session.id.split('@');
      const sessionId = tokens.length > 1 ? tokens[1] : '';
      if (sessionId) {
        resultObject.__searchLink = `${
          options.url
        }sessions?expression=id${encodeURIComponent(
          '=='
        )}${sessionId}&startTime=${convertMillisecondsToSecondsRoundDown(
          session.firstPacket
        )}&stopTime=${convertMillisecondsToSecondsRoundUp(session.lastPacket)}`;
      }

      sessions.push(resultObject);
    });

    lookupResults.push({
      entity,
      data: {
        summary: createSummary(apiResponse.data, options),
        details: {
          sessions,
          fields: fieldsAsArray,
          summaryFields,
          totalSessions: apiResponse.recordsFiltered,
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
  if (Array.isArray(apiResponse.data)) {
    apiResponse.data.forEach((session) => {
      if (session.ipProtocol) {
        session.ipProtocolHumanized = ipProtocolNumbers[session.ipProtocol];
      }
    });
  }

  return apiResponse;
};

/**
 * Creates the Summary Tags (currently just tags for ports)
 * @param match
 * @returns {string[]}
 */
const createSummary = (match, options) => {
  const tags = [];

  tags.push(`Sessions: ${match.length}`);

  return tags;
};

module.exports = {
  createResultObjects
};
