const Express = require('express');
const SequelizeAuto = require('sequelize-auto');
const Sequelize = require('sequelize');
const fs = require("fs");
const path= require("path");

const app = Express();
const auto = new SequelizeAuto('alloy', 'postgres', '', {
    host: 'localhost',
    schema: 'alloy',
    dialect: 'postgres',
    port: '5432',
    additional: {
        timestamps: false,
    },
    dialectOptions: {
      schema: 'alloy',
    }
});
const sequelize = new Sequelize('alloy', 'postgres', '', {
  host: 'localhost',
  schema: 'alloy',
  dialect: 'postgres',
  port: '5432',
  schema: 'alloy',
  dialectOptions: {
    schema: 'alloy',
  }
});

app.use(Express.static('assets/lib'));

auto.run((err) => {
  const models = {};

  fs.readdirSync(__dirname + "/models")
    .filter(function(file) {
      return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function(file) {
      models[file.slice(0, -3)] = sequelize.import(path.join(__dirname + "/models", file));
    });

  app.get('/tables', (req, res) => {
    res.send(auto.tables);
  });

  app.get('/tables/:table', (req, res) => {
    res.send(auto.tables[req.params.table]);
  });

  app.get('/tables/:table/data', (req, res) => {
    models[req.params.table].schema('alloy').findAll({})
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log(err);
        res.error("Goddam error");
      });
  });

  app.get('/tables/:table/trend', (req, res) => {
    const whereClause = {};
    const timestampField = req.query.timestamp_field || 'timestamp';
    const interval = req.query.interval || 'month';
    if (req.query.start_time) {
      whereClause[timestampField] = {$gte: req.query.start_time};
    }

    if (req.query.end_time) {
      whereClause[timestampField] = {$lte: req.query.end_time};
    }
    models[req.params.table].schema('alloy').findAll({
      attributes: [
        [sequelize.fn('date_trunc', interval, sequelize.col(timestampField)), 'date'],
        [sequelize.fn('count', sequelize.col('*')), 'count'],
      ],
      group: [sequelize.fn('date_trunc', interval, sequelize.col(timestampField))],
      where: whereClause,
      order: 'date ASC',
    })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log(err);
        res.error("Goddam error")
      });
  });

  app.listen(3000, function () {
    console.log('App listening on port 3000')
  });
})


