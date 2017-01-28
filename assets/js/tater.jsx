import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';
import moment from 'moment';
// import c3 from 'c3';
import { DateRangePicker } from 'react-dates';
import 'keen-dataviz';
import 'bootstrap/dist/css/bootstrap.css';
import 'keen-dashboards/dist/keen-dashboards.css';
import 'keen-dataviz/dist/keen-dataviz.css';

// import 'c3/c3.css';
import 'react-dates/lib/css/_datepicker.css';
import '../css/tater.scss';

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

function calculateAverageGrowth(trend) {
  console.log(trend);
  const totalChange = trend[trend.length - 1].count / trend[0].count;
  const exponentChange = (1 / (trend.length - 1));
  const averageGrowth = (Math.pow(totalChange, exponentChange) - 1) * 100;
  return averageGrowth;
}

function generateMetricChart(element, title, data) {
  new Keen.Dataviz()
    .el(document.getElementById(element))
    .title(title)
    .type('metric')
    .prepare()
    .data({ result: data })
    .render();
}

class Tater extends React.Component {
  constructor(props) {
    super(props);

    [
      '_handleUpdateState',
      '_handleUpdateDateRange',
      '_handleUpdateFocusedInput',
      'generateMainChart',
      'requestData',
    ].forEach((method) => { this[method] = this[method].bind(this); });

    this.state = {
      tableName: false,
      columnName: false,
      startDate: moment().subtract(3, 'months'),
      endDate: moment(),
      interval: 'day',
      tableData: {},
      focusedInput: null,
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


  _handleUpdateDateRange(range) {
    this.setState(range, () => { this.requestData(); });
  }


  _handleUpdateFocusedInput(focusedInput) {
    this.setState({ focusedInput });
  }

  generateMainChart(element) {
    const main = new Keen.Dataviz()
      .el(document.getElementById(element))
      .chartType('line')
      .height(250)
      .colors(['#6ab975'])
      .chartOptions({
        data: {
          x: 'date',
        },
        axis: {
          x: {
            localtime: false,
            type: 'timeseries',
            tick: {
              format: '%m-%d',
            },
          },
        },
        tooltip: {
          format: {
            name: (name, ratio, id, index) => {
              if (index > 0) {
                const previousValue = main.dataset.matrix[index][1];
                const currentValue = main.dataset.matrix[index + 1][1];
                const growth = ((previousValue - currentValue) / previousValue) * -100;
                return `${growth}%`;
              }
              return 'N/A';
            },
          },
        },
      })
    .prepare()
    .data(this.state.tableData.trend)
    .render();
  }

  requestData() {
    if (this.state.tableName && this.state.columnName) {
      $.ajax({
        url: `/tables/${this.state.tableName}/trend`,
        method: 'GET',
        data: {
          start_time: this.state.startDate.format(),
          end_time: this.state.endDate.format(),
          interval: this.state.interval,
          timestamp_field: this.state.columnName,
        },
        success: (data) => {
          const trend = data.trend;
          const mainDataSet = new Dataset();
          Object.keys(trend).forEach((key) => {
            mainDataSet.set([this.state.tableName, trend[key].date], trend[key].count);
          });
          const tableDataObj = {};
          tableDataObj.trend = mainDataSet;
          this.setState({ tableData: tableDataObj }, () => {
            this.generateMainChart('tater-chart');
            generateMetricChart('metric-01', `Total This ${this.state.interval}`, trend[trend.length -1].count);
            generateMetricChart('metric-02', 'Total In Range', data.total);
            generateMetricChart('metric-03', 'Average Growth', calculateAverageGrowth(trend));
          });
        },
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
        <div id="app-toolbar" className="tater-header">
          <div className="row tools">
            <div className="col-sm-2 tool coordinates">
              <h5>Model</h5>
              <select
                id="tableName"
                className="form-control"
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
            </div>

            {tableName ? (
              <div className="col-sm-2 tool coordinates">
                <h5>Column</h5>
                <select
                  name="columnName"
                  className="form-control"
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
              </div>
            ) : false}

            {columnName ? (
              <div>
                <div className="col-sm-3 tool">
                  <h5>Date Range:</h5>
                  <DateRangePicker
                    startDate={this.state.startDate}
                    endDate={this.state.endDate}
                    focusedInput={this.state.focusedInput}
                    isDayBlocked={day => day.isAfter(moment())}
                    isOutsideRange={() => false}
                    initialVisibleMonth={() => this.state.startDate}
                    onDatesChange={this._handleUpdateDateRange}
                    onFocusChange={this._handleUpdateFocusedInput}
                  />
                </div>

                <div className="col-sm-2 tool coordinates">
                  <h5>Interval:</h5>
                  <select
                    name="interval"
                    className="form-control"
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
              </div>
            ) : false}
          </div>
        </div>

        <div className="container-fluid main-dashboard">
          <div className="row">
            <div className="col-sm-12">
              <div className="chart-wrapper">
                <div className="chart-stage">
                  <div className="chart-title">
                    Model Stats
                  </div>
                  <div id="tater-chart" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-4">
            <div className="chart-wrapper">
              <div className="chart-stage">
                <div id="metric-01" />
              </div>
            </div>
          </div>

          <div className="col-sm-4">
            <div className="chart-wrapper">
              <div className="chart-stage">
                <div id="metric-02" />
              </div>
            </div>
          </div>

          <div className="col-sm-4">
            <div className="chart-wrapper">
              <div className="chart-stage">
                <div id="metric-03" />
              </div>
            </div>
          </div>
        </div>
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
        document.getElementById('tater-container'),
      );
    },
    error: () => {
      console.log('Something went wrong');
    },
  });
});
