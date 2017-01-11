const Config = require('./config');
const Express = require('express');
const SequelizeAuto = require('sequelize-auto');
const Sequelize = require('sequelize');
const _ = require('underscore');
const Moment = require('moment');
const fs = require('fs');
const path = require('path');

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
    const interval = req.query.interval || Config.defaults.interval;
    if (req.query.start_time) {
      whereClause[timestampField] = { $gte: req.query.start_time };
    }

    if (req.query.end_time) {
      whereClause[timestampField] = { $lte: req.query.end_time };
    }
    return model.schema(Config.database.sequelizeOptions.dialectOptions.schema).findAll({
      where: whereClause,
      order: `${timestampField} ASC`,
    })
      .then((data) => {
        const countArr = [];
        const groups = _.groupBy(data, inst =>
          Moment(inst.dataValues.timestamp).startOf(interval).format()
        );
        _.each(groups, (value, key) => {
          countArr.push({
            date: key,
            count: value.length,
          });
        });
        console.log(countArr);
        res.send(countArr);
      })
      .catch(err =>
        console.error(err)
      );
  });

  app.listen(3000, () => {
    console.log('App listening on port 3000');
  });
});
