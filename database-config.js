const Config = require('./config');

const dbNormalizer = {};
dbNormalizer.dateGroupFormat = {};
dbNormalizer.dateGroupFunction = Config.database.sequelizeOptions.dialect === 'postgres' ? 'to_char' : 'DATE_FORMAT';
dbNormalizer.dateGroupFormat.day = Config.database.sequelizeOptions.dialect === 'postgres' ? 'YYYY-mm-dd' : '%Y-%m-%d';
dbNormalizer.dateGroupFormat.month = Config.database.sequelizeOptions.dialect === 'postgres' ? 'YYYY-mm' : '%Y-%m';

module.exports = {
  dbNormalizer: {
    dateGroupFunction: dbNormalizer.dateGroupFunction,
    dateGroupFormat: dbNormalizer.dateGroupFormat,
  },
};
