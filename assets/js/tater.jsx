import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';


class Tater extends React.Component {
  render() {
    return (
      <div className="tater-component" />
    );
  }
}


document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(<Tater />, document.getElementById('tater-container'));
});
