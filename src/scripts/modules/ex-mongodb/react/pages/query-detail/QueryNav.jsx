import PropTypes from 'prop-types';
import React from 'react';

import {SearchBar} from '@keboola/indigo-ui';
import NavRow from './QueryNavRow';
import CreateQueryElement from '../../components/CreateQueryElement';

export default React.createClass({
  propTypes: {
    queries: PropTypes.object.isRequired,
    navQuery: PropTypes.object.isRequired,
    editingQueries: PropTypes.object.isRequired,
    newQueries: PropTypes.object.isRequired,
    newQueriesIdsList: PropTypes.object.isRequired,
    configurationId: PropTypes.string.isRequired,
    filter: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    actionCreators: PropTypes.object.isRequired
  },

  render() {
    return (
      <div>
        <div className="layout-master-detail-search">
          <SearchBar query={this.props.filter} onChange={this.handleFilterChange} />
        </div>
        <div className="list-group">
          <CreateQueryElement
            isNav={true}
            configurationId={this.props.configurationId}
            actionCreators={this.props.actionCreators}
            componentId={this.props.componentId}
          />
          {this.rows()}
        </div>
      </div>
    );
  },

  rows() {
    const { newQueriesIdsList, queries, editingQueries } = this.props;

    const originalQueryIds = queries.map(query => {
      return query.get('id');
    });

    // filter only new queries and sort them by those added latest (like "desc by time")
    const sidebarNewQueries = editingQueries
      .filter(query => {
        return originalQueryIds.indexOf(query.get('id')) === -1;
      })
      .sort((valueA, valueB) => {
        if (
          newQueriesIdsList.indexOf(valueA.get('id')) < newQueriesIdsList.indexOf(valueB.get('id'))
        ) {
          return -1;
        } else if (
          newQueriesIdsList.indexOf(valueA.get('id')) > newQueriesIdsList.indexOf(valueB.get('id'))
        ) {
          return 1;
        } else {
          return 0;
        }
      })
      .map(query => {
        return {
          isEditing: true, // we're always editing new query
          value: query
        };
      })
      .toArray();

    // map original queries and replace those which are edited
    const sidebarOriginalQueries = queries
      .map(query => {
        const isEditing = editingQueries.keySeq().indexOf(query.get('id')) > -1;
        return {
          isEditing: isEditing,
          value: isEditing ? editingQueries.get(query.get('id')) : query
        };
      })
      .toArray();

    return sidebarNewQueries.concat(sidebarOriginalQueries).map(query => {
      return (
        <NavRow
          key={query.value.get('id')}
          query={query.value}
          configurationId={this.props.configurationId}
          componentId={this.props.componentId}
          isEditing={query.isEditing}
        />
      );
    });
  },

  handleFilterChange(newQuery) {
    this.props.actionCreators.setQueriesFilter(this.props.configurationId, newQuery);
  }
});
