const Config = require('./config');

const dbNormalizer = {};
dbNormalizer.dateGroupFormat = {};

if (Config.database.sequelizeOptions.dialect === 'postgres') {
  dbNormalizer.dateGroupFunction = 'to_char';
  dbNormalizer.dateGroupFormat.day = 'YYYY-mm-dd';
  dbNormalizer.dateGroupFormat.month = 'YYYY-mm';
} else {
  dbNormalizer.dateGroupFunction = 'DATE_FORMAT';
  dbNormalizer.dateGroupFormat.day = '%Y-%m-%d';
  dbNormalizer.dateGroupFormat.month = '%Y-%m';
}

module.exports = {
  dbNormalizer: {
    dateGroupFunction: dbNormalizer.dateGroupFunction,
    dateGroupFormat: dbNormalizer.dateGroupFormat,
  },
};
