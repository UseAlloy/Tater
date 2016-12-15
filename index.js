const Express = require('express');
const SequelizeAuto = require('sequelize-auto');

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

app.get('/tables', (req, res) => {
  auto.run((err) => {
    if (err) throw err;
    res.send(auto.tables);
  });
});

app.listen(3000, function () {
  console.log('App listening on port 3000')
});
