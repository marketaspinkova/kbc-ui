import PropTypes from 'prop-types';
import React from 'react';
import {Tab} from 'react-bootstrap';

export default React.createClass({

  propTypes: {
    step: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    children: PropTypes.node,
    buttons: PropTypes.node
  },

  render() {
    return (
      <Tab eventKey={this.props.step} title={this.props.title}>
        <div className="row" style={this.style()}>
          {this.props.children}
        </div>
        <div className="kbc-row clearfix">
          <div className="pull-right">
            {this.props.buttons}
          </div>
        </div>
      </Tab>
    );
  },

  style() {
    return {
      minHeight: '120px'
    };
  }

});
