const Config = require('./config');

const dbNormalizer = {};

if (Config.database.sequelizeOptions.dialect === 'postgres') {
  dbNormalizer.dateGroupFunction = 'to_char';
  dbNormalizer.dateGroupFormat = 'YYYY-mm-dd';
} else {
  dbNormalizer.dateGroupFunction = 'DATE_FORMAT';
  dbNormalizer.dateGroupFormat = '%Y-%m-%d';
}

module.exports = {
  dbNormalizer: {
    dateGroupFunction: dbNormalizer.dateGroupFunction,
    dateGroupFormat: dbNormalizer.dateGroupFormat,
  },
};
