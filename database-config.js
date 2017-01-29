const Config = require('./config');
const Moment = require('moment');

Config.database.sequelizeOptions.timezone = Moment().format('Z');

const dbType = Config.database.sequelizeOptions.dialect;
const dbNormalizer = {};
dbNormalizer.dateGroupFormat = {};
dbNormalizer.dateGroupFunction = dbType === 'postgres' ? 'to_char' : 'DATE_FORMAT';
dbNormalizer.dateGroupFormat.day = dbType === 'postgres' ? 'YYYY-mm-dd' : '%Y-%m-%d';
dbNormalizer.dateGroupFormat.month = dbType === 'postgres' ? 'YYYY-mm' : '%Y-%m';

module.exports = {
  dbNormalizer: {
    dateGroupFunction: dbNormalizer.dateGroupFunction,
    dateGroupFormat: dbNormalizer.dateGroupFormat,
  },
};
