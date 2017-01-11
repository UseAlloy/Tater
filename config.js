module.exports = {
  database: {
    name: 'alloy',
    user: 'postgres',
    password: '',
    sequelizeOptions: {
      host: 'localhost',
      schema: 'alloy',
      dialect: 'postgres',
      port: '5432',
      additional: {
          timestamps: false,
      },
      dialectOptions: {
        schema: 'alloy',
      },
    },
  },
  defaults: {
    interval: 'month',
    timestampField: 'timestamp',
  },
};
