const Config = require('./config');
const DBConfig = require('./database-config');
const Express = require('express');
const SequelizeAuto = require('sequelize-auto');
const Sequelize = require('sequelize');
const _ = require('lodash');
const Moment = require('moment');
const fs = require('fs');
const path = require('path');

const createDateArray = (startDate, endDate, interval) => {
  const dateArray = [];
  const date = startDate.startOf(interval);
  while (date <= endDate) {
    dateArray.push(Moment.utc(date).startOf(interval).format());
    date.add(1, interval);
  }

  return _.map(dateArray, dateVal => ({
    date: dateVal,
    count: 0,
  }));
};

const app = Express();
const auto = new SequelizeAuto(
  Config.database.name,
  Config.database.user,
  Config.database.password,
  Config.database.sequelizeOptions
);
const sequelize = new Sequelize(
  Config.database.name,
  Config.database.user,
  Config.database.password,
  Config.database.sequelizeOptions
);

app.use(Express.static('assets/lib'));

auto.run(() => {
  const models = {};

  fs.readdirSync(`${__dirname}/models`)
    .filter(file =>
      (file.indexOf('.') !== 0) && (file !== 'index.js')
    )
    .forEach((file) => {
      models[file.slice(0, -3)] = sequelize.import(path.join(`${__dirname}/models`, file));
    });

  app.get('/tables', (req, res) => {
    res.send(auto.tables);
  });

  app.get('/tables/:table', (req, res) => {
    res.send(auto.tables[req.params.table]);
  });

  app.get('/tables/:table/data', (req, res) => {
    const model = models[req.params.table];
    if (!model) {
      return res.status(404).send({
        status: 'error', message: `Table ${req.params.table} does not exist`,
      });
    }
    return model.schema(Config.database.sequelizeOptions.dialectOptions.schema).findAll({})
      .then((data) => {
        res.send(data);
      })
      .catch(err =>
        console.error(err)
      );
  });

  app.get('/tables/:table/trend', (req, res) => {
    const model = models[req.params.table];
    if (!model) {
      return res.status(404).send({
        status: 'error', message: `Table ${req.params.table} does not exist`,
      });
    }

    const whereClause = {};
    const timestampField = req.query.timestamp_field || Config.defaults.timestampField;
    whereClause[timestampField] = {};
    const interval = req.query.interval || Config.defaults.interval;

    if (req.query.start_time) {
      whereClause[timestampField].$gte = req.query.start_time;
    }

    if (req.query.end_time) {
      whereClause[timestampField].$lte = req.query.end_time;
    }

    return model.schema(Config.database.sequelizeOptions.dialectOptions.schema).findAll({
      attributes: [
        [sequelize.fn(DBConfig.dbNormalizer.dateGroupFunction, sequelize.col(timestampField), DBConfig.dbNormalizer.dateGroupFormat), 'date'],
        [sequelize.fn('count', sequelize.col('*')), 'count'],
      ],
      where: whereClause,
      order: `date ASC`,
      group: 'date',
    })
      .then((data) => {
        // console.log(data);

        const countArr = _.map(data, value => ({
          date: Moment.utc(value.dataValues.date).startOf(interval).format(),
          count: Number(value.dataValues.count),
        }));
        const countAll = countArr.reduce((sum = 0, value) => (
          sum + value.count
        ), 0);

        const startDate = Moment.utc(req.query.start_time ? new Date(req.query.start_time) : countArr[0].date);
        const endDate = Moment.utc(req.query.end_time ? new Date(req.query.end_time) : countArr[countArr.length - 1].date);

        const allDates = createDateArray(startDate, endDate, interval);
        const allDatesWithCounts = _.unionBy(countArr, allDates, 'date');

        const trendData = {};
        trendData.trend = _.orderBy(allDatesWithCounts, 'date');
        trendData.total = countAll;

        res.send(trendData);
      })
      .catch(err =>
        console.error(err)
      );
  });

  app.listen(3000, () => {
    console.log('App listening on port 3000');
  });
});
