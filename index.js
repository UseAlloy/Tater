const SequelizeAuto = require('sequelize-auto');

const auto = new SequelizeAuto('alloy', 'postgres', '', {
    host: 'localhost',
    schema: 'alloy',
    dialect: 'postgres',
    port: '5432',
    additional: {
        timestamps: false,
    },
});

auto.run(function (err) {
  if (err) throw err;

  console.log(auto.tables); // table list
  console.log(auto.foreignKeys); // foreign key list
});
