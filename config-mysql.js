module.exports = {
  database: {
    name: 'notes',
    user: 'root',
    password: 'root',
    sequelizeOptions: {
      host: 'localhost',
      dialect: 'mysql',
      port: '8889',
      additional: {
        timestamps: false,
      },
      dialectOptions: {},
    },
  },
  defaults: {
    interval: 'month',
    timestampField: 'timestamp',
  },
};
