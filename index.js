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
    models[req.params.table].schema('alloy').findAll({})
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        console.log(err);
        res.error("Goddam error");
      });
  });

  app.listen(3000, function () {
    console.log('App listening on port 3000')
  });
})
