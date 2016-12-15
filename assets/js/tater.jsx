import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';


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
    }
  }


  _handleUpdateState(event) {
    const newState = {};
    newState[event.target.name] = event.target.value === 'false' ? false : event.target.value;
    this.setState(newState);
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
