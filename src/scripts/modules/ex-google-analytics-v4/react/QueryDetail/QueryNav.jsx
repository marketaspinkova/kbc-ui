import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {SearchBar} from '@keboola/indigo-ui';
import NavRow from './QueryNavRow';


export default createReactClass({
  propTypes: {
    queries: PropTypes.object.isRequired,
    configurationId: PropTypes.string.isRequired,
    filter: PropTypes.string.isRequired,
    setQueriesFilter: PropTypes.func.isRequired,
    componentId: PropTypes.string.isRequired
  },
  render() {
    return (
      <div>
        <div className="layout-master-detail-search">
          <SearchBar
            query={this.props.filter}
            onChange={this.handleFilterChange}
          />
        </div>
        <div className="list-group">
          {this.rows()}
        </div>
      </div>
    );
  },

  rows() {
    if (this.props.queries.count()) {
      return this.props.queries.map((query, idx) => {
        return (
          <NavRow
            key={idx}
            query={query}
            configurationId={this.props.configurationId}
            componentId={this.props.componentId}
          />
        );
      });
    } else {
      return (
        <div className="list-group-item">
          No queries found.
        </div>
      );
    }
  },

  handleFilterChange(newQuery) {
    this.props.setQueriesFilter(newQuery);
  }
});
