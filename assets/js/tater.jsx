import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import moment from 'moment';
import c3 from 'c3';

import 'c3/c3.css';
import '../css/tater.scss';

const DATE_RANGE_OPTIONS = {
  day: { text: 'Past Day', days: 1 },
  week: { text: 'Past Week', days: 7 },
  month: { text: 'Past Month', days: 30 },
  three_months: { text: 'Past 3 Months', days: 90 },
  year: { text: 'Past Year', days: 365 },
};

const INTERVAL_OPTIONS = {
  hour: { text: 'Hour' },
  day: { text: 'Day' },
  week: { text: 'Week' },
  month: { text: 'Month' },
};


const TaterPropTypes = {
  tables: PropTypes.object.isRequired,
  timestampTables: PropTypes.array.isRequired,
};

class Tater extends React.Component {
  constructor(props) {
    super(props);

    [
      '_handleUpdateState',
      'generateChart',
      'requestData'
    ].forEach(method => { this[method] = this[method].bind(this); });

    this.state = {
      tableName: false,
      columnName: false,
      dateRange: 'three_months',
      interval: 'day',
      tableData: [],
    };
  }


  _handleUpdateState(event) {
    const newState = {};
    const value = event.target.value === 'false' ? false : event.target.value;

    newState[event.target.name] = value;

    if (event.target.name === 'tableName') {
      if (value) {
        newState.columnName = Object.keys(this.props.tables[value]).find(column => (
          this.props.tables[value][column].type.indexOf('TIMESTAMP') > -1 ||
            this.props.tables[value][column].type.indexOf('DATE') > -1
        ));
      } else {
        newState.columnName = false;
      }
    }

    this.setState(newState, () => { this.requestData(); });
  }


  generateChart() {
    c3.generate({
      bindto: '#tater-chart',
      size: {
        width: 960,
      },
      data: {
        x: 'x',
        xFormat: this.state.interval === 'hour' ? '%Y-%m-%d %H:%M:%S' : '%Y-%m-%d',
        columns: [
          ['x'].concat(this.state.tableData.map(d => (
            this.state.interval === 'hour'
              ? moment(d.date).format('YYYY-MM-DD HH:mm:ss')
              : moment(d.date).format('YYYY-MM-DD')
          ))),
          ['count'].concat(this.state.tableData.map(d => d.count)),
        ],
      },
      axis: {
        x: {
          localtime: false,
          type: 'timeseries',
          tick: {
            format: this.state.interval === 'hour' ? '%m-%d %H:%M' : '%m-%d',
          }
        }
      },
    });
  }


  requestData() {
    if (this.state.tableName && this.state.columnName) {
      $.ajax({
        url: `/tables/${this.state.tableName}/trend`,
        method: 'GET',
        data: {
          start_time: moment().subtract(
            DATE_RANGE_OPTIONS[this.state.dateRange].days, 'days'
          ).utc().format(),
          end_time: moment().utc().format(),
          interval: this.state.interval,
          timestamp_field: this.state.columnName,
        },
        success: (data) => { this.setState({ tableData: data }, () => { this.generateChart(); }); },
        error: () => { console.log('Something went wrong.'); },
      });
    } else {
      this.setState({ tableData: [] });
    }
  }


  render() {
    const tables = this.props.tables;
    const tableName = this.state.tableName;
    const columnName = this.state.columnName;

    return (
      <div className="tater-component">
        <div className="tater-header">
          <select
            name="tableName"
            value={tableName}
            onChange={this._handleUpdateState}
          >
            {[
              <option key={0} value="false">Select a Table</option>,
            ].concat(this.props.timestampTables.sort((a, b) => (
              a.localeCompare(b)
            )).map((table, idx) => (
              <option key={idx + 1} value={table}>{table}</option>
            )))}
          </select>

          {tableName ? (
            <select
              name="columnName"
              value={columnName}
              onChange={this._handleUpdateState}
            >
              {Object.keys(tables[tableName]).filter(column => (
                tables[tableName][column].type.indexOf('TIMESTAMP') > -1 ||
                  tables[tableName][column].type.indexOf('DATE') > -1
              )).sort((a, b) => a.localeCompare(b)).map((column, idx) => (
                <option key={idx + 1} value={column}>{column}</option>
              ))}
            </select>
          ) : false}

          {columnName ? (
            <div className="date-selects">
              <select
                name="dateRange"
                value={this.state.dateRange}
                onChange={this._handleUpdateState}
              >
                {Object.keys(DATE_RANGE_OPTIONS).map((rangeOption, index) => (
                  <option key={index} value={rangeOption}>
                    {DATE_RANGE_OPTIONS[rangeOption].text}
                  </option>
                ))}
              </select>

              <select
                name="interval"
                value={this.state.interval}
                onChange={this._handleUpdateState}
              >
                {Object.keys(INTERVAL_OPTIONS).map((intervalOption, index) => (
                  <option key={index} value={intervalOption}>
                    {INTERVAL_OPTIONS[intervalOption].text}
                  </option>
                ))}
              </select>
            </div>
          ) : false}
        </div>

        <div id="tater-chart" />
      </div>
    );
  }
}
Tater.propTypes = TaterPropTypes;


document.addEventListener('DOMContentLoaded', () => {
  $.ajax({
    url: '/tables',
    method: 'GET',
    success: (data) => {
      const timestampTables = Object.keys(data).filter(tableName => (
        Object.keys(data[tableName]).filter(column => (
          data[tableName][column].type.indexOf('TIMESTAMP') > -1 ||
            data[tableName][column].type.indexOf('DATE') > -1
        )).length > 0
      ));

      ReactDOM.render(
        <Tater tables={data} timestampTables={timestampTables} />,
        document.getElementById('tater-container')
      );
    },
    error: () => {
      console.log('Something went wrong');
    }
  })
});
