import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import moment from 'moment';
import { LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line } from 'recharts';


const DATE_RANGE_OPTIONS = {
  day: { text: 'Past Day', days: 1 },
  week: { text: 'Past Week', days: 7 },
  month: { text: 'Past Month', days: 30 },
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
};

class Tater extends React.Component {
  constructor(props) {
    super(props);

    [
      '_handleUpdateState',
    ].forEach(method => { this[method] = this[method].bind(this); });

    this.state = {
      tableName: false,
      columnName: false,
      dateRange: 'month',
      interval: 'day',
    };
  }


  _handleUpdateState(event) {
    const newState = {};
    const value = event.target.value === 'false' ? false : event.target.value;

    newState[event.target.name] = value;

    if (event.target.name === 'tableName' && !value) newState.columnName = false;

    this.setState(newState, () => { this.requestData(); });
  }


  requestData() {
    if (this.state.tableName && this.state.columnName) {
      const now = moment();
      $.ajax({
        url: `/tables/${this.state.tableName}`,
        method: 'GET',
        data: {
          start_time: now.subtract(DATE_RANGE_OPTIONS[this.state.dateRange].days, 'days'),
          end_time: now,
          interval: this.state.interval,
          timestamp_field: this.state.columnName,
        },
        success: (data) => { this.setState({ tableData: data }); },
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
        <select
          name="tableName"
          value={tableName}
          onChange={this._handleUpdateState}
        >
          {[
            <option key={0} value="false">Select a Table</option>,
          ].concat(Object.keys(tables).map((table, idx) => (
            <option key={idx + 1} value={table}>{table}</option>
          )))}
        </select>

        {tableName ? (
          <select
            name="columnName"
            value={columnName}
            onChange={this._handleUpdateState}
          >
            {[
              <option key={0} value="false">Select a Column</option>,
            ].concat(Object.keys(tables[tableName]).map((column, idx) => (
              <option key={idx + 1} value={column}>{column}</option>
            )))}
          </select>
        ) : false}

        {columnName ? (
          <div>
            <select
              name="dateRange"
              value={this.state.dateRange}
              onChange={this._handleUpdateState}
            >
              {Object.keys(DATE_RANGE_OPTIONS).map((rangeOption, index) => (
                <option key={index} value={rangeOption}>{rangeOption.text}</option>
              ))}
            </select>

            <select
              name="interval"
              value={this.state.interval}
              onChange={this._handleUpdateState}
            >
              {Object.keys(INTERVAL_OPTIONS).map((intervalOption, index) => (
                <option key={index} value={intervalOption}>{intervalOption.text}</option>
              ))}
            </select>
          </div>
        ) : false}

        {this.state.tableData ? (
          <div className="tater-chart">
            <LineChart width={600} height={400} data={this.state.tableData}>
              <XAxis dataKey={this.state.columnName} />
              <YAxis dataKey="count" />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#D63B3B" />
            </LineChart>
          </div>
        ) : false}
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
      ReactDOM.render(<Tater tables={data} />, document.getElementById('tater-container'));
    },
    error: () => {
      console.log('Something went wrong');
    }
  })
});
