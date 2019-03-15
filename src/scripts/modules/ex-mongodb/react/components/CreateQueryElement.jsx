import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Navigation } from 'react-router';

export default createReactClass({
  displayName: 'CreateQueryElement',
  mixins: [Navigation],
  propTypes: {
    isNav: PropTypes.bool.isRequired,
    configurationId: PropTypes.string.isRequired,
    componentId: PropTypes.string,
    actionCreators: PropTypes.object.isRequired
  },

  createQuery() {
    let query = this.props.actionCreators.createNewQuery(this.props.configurationId);
    this.transitionTo(
      'ex-mongodb-query',
      {
        config: this.props.configurationId,
        query: query.get('id')
      }
    );
  },

  render() {
    if (this.props.isNav) {
      return (
        <a className="list-group-item" onClick={this.createQuery}>
          <strong><i className="kbc-icon-plus"/>
            Create a new entry
          </strong>
        </a>
      );
    } else {
      return (
        <button
          className="btn btn-success"
          onClick={this.createQuery}
        >
          <i className="kbc-icon-plus"/> New Export
        </button>
      );
    }
  }
});
