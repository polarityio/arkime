'use strict';

const async = require('async');

const { setLogger } = require('./src/logger');
const { parseErrorToReadableJSON, ApiRequestError } = require('./src/errors');
const { createResultObjects } = require('./src/create-result-object');
const { searchSessions } = require('./src/search-sessions');
const { getFields } = require('./src/get-fields');

const MAX_TASKS_AT_A_TIME = 2;
const DEFAULT_SUMMARY_FIELDS =
  'firstPacket, lastPacket, ipProtocol, source.ip, source.port, destination.ip, destination.port, network.packets, network.bytes, node';
let Logger = null;
let fieldsAsArray = [];
let fieldsAsString = '';
let fieldsByFieldName = {};
let summaryFields = [];
let previousSummaryFieldOptionValue = null;

const startup = (logger) => {
  Logger = logger;
  setLogger(Logger);
};

const doLookup = async (entities, options, cb) => {
  Logger.trace({ entities }, 'doLookup');

  let lookupResults = [];
  const tasks = [];

  options.url = options.url.endsWith('/') ? options.url : `${options.url}/`;

  entities.forEach((entity) => {
    tasks.push(async () => {
      const sessionDetails = await searchSessions(entity, options, fieldsAsString);
      const sessionResultObjects = createResultObjects(
        entity,
        sessionDetails,
        fieldsAsArray,
        summaryFields,
        options
      );
      lookupResults = lookupResults.concat(sessionResultObjects);
    });
  });

  try {
    await maybeCacheFields(options);
    maybeCacheSummaryFields(options);
    await async.parallelLimit(tasks, MAX_TASKS_AT_A_TIME);
  } catch (error) {
    Logger.error({ error }, 'Error in doLookup');
    return cb(error);
  }

  Logger.trace({ lookupResults }, 'Lookup Results');
  cb(null, lookupResults);
};

const maybeCacheFields = async (options) => {
  if (fieldsAsArray.length === 0) {
    fieldsAsArray = await getFields(options);
    fieldsAsString = fieldsAsArray.map((field) => field.dbField).join(',');
    fieldsByFieldName = fieldsAsArray.reduce((accum, field) => {
      accum[field.dbField] = field;
      return accum;
    }, {});
  }
};

const maybeCacheSummaryFields = (options) => {
  if (
    previousSummaryFieldOptionValue !== null &&
    previousSummaryFieldOptionValue === options.summary
  ) {
    return;
  }

  summaryFields = [];

  previousSummaryFieldOptionValue = options.summary;

  let summaryTokens = options.summary.split(',').map((field) => field.trim());

  if (summaryTokens.length === 0) {
    summaryTokens = DEFAULT_SUMMARY_FIELDS.split(',').map((field) => field.trim());
  }

  summaryTokens.forEach((field) => {
    field = typeof field === 'string' ? field.trim() : '';
    if (fieldsByFieldName[field]) {
      summaryFields.push(fieldsByFieldName[field]);
    }
  });
};

function validateOptions(userOptions, cb) {
  let errors = [];

  if (
    typeof userOptions.url.value !== 'string' ||
    (typeof userOptions.url.value === 'string' && userOptions.url.value.length === 0)
  ) {
    errors.push({
      key: 'url',
      message: 'You must provide a valid Arkime URL'
    });
  }

  if (
    typeof userOptions.username.value !== 'string' ||
    (typeof userOptions.username.value === 'string' &&
      userOptions.username.value.length === 0)
  ) {
    errors.push({
      key: 'username',
      message: 'You must provide a valid Arkime username'
    });
  }

  if (
    typeof userOptions.password.value !== 'string' ||
    (typeof userOptions.password.value === 'string' &&
      userOptions.password.value.length === 0)
  ) {
    errors.push({
      key: 'password',
      message: 'You must provide a valid Arkime password'
    });
  }

  if (userOptions.hoursBack.value < -1) {
    errors.push({
      key: 'hoursBack',
      message: 'You must provide a value greater than or equal to -1'
    });
  }

  if (
    userOptions.ipExpression.value.length === 0 &&
    userOptions.domainExpression.value.length === 0 &&
    userOptions.urlExpression.value.length === 0
  ) {
    errors.push({
      key: 'ipExpression',
      message: 'You must provide at least one expression for session searches to work'
    });
    errors.push({
      key: 'domainExpression',
      message: 'You must provide at least one expression for session searches to work'
    });
    errors.push({
      key: 'urlExpression',
      message: 'You must provide at least one expression for session searches to work'
    });
  }

  cb(null, errors);
}

module.exports = {
  startup,
  doLookup,
  validateOptions
};
