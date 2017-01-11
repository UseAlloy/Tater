# Tater
Database analytics

## Getting started
- run `npm install` in the project root
- compile static assets with `npm run compile-assets`
- edit the `config.json` file to connect to your database:
```
module.exports = {
  database: {
    name: 'alloy',
    user: 'postgres',
    password: '',
    sequelizeOptions: {
      host: 'localhost',
      schema: 'alloy', -- not necessary for MySQL
      dialect: 'postgres', -- options are postgres | mysql | sqlite | mssql (postgres and mysql only tested)
      port: '5432',
      additional: {
        timestamps: false,
      },
      dialectOptions: {
        schema: 'alloy', -- not necessary for MySQL
      },
    },
  },
  defaults: {
    interval: 'month',
    timestampField: 'timestamp',
  },
};

```
- finally, run the server with `node index.js`

**Now you should be able to hit the frontend!**

Go to `http://localhost:3000/` by default

## Details of the API
Example API query:

`http://localhost:3000/tables/Holidays/trend?start_time=2014-08-01T04:00:00.000Z&end_time=2016-12-05T05:00:00.000Z&timestamp_field=date`

### Endpoints
`http://localhost:3000/tables` - list all tables

`http://localhost:3000/tables/<table_name>` - list attributes of one table

`http://localhost:3000/tables/<table_name>/trend` - get data from one table over time
- `start_time` - ISO-formatted start time for graph
- `end_time` - ISO-formatted end time for graph
- `timestamp_field` - database field to be used as timestamp for date grouping
- `interval` - how often to group, options are hour | day | month
