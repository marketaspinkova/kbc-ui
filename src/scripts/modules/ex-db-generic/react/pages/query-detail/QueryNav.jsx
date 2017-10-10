import React, {PropTypes} from 'react';
import SearchRow from '../../../../../react/common/SearchRow';
import NavRow from './QueryNavRow';
import CreateQueryElement from '../../components/CreateQueryElement';

export default React.createClass({
  propTypes: {
    queries: PropTypes.object.isRequired,
    navQuery: PropTypes.object.isRequired,
    editingQueries: PropTypes.object.isRequired,
    newQueries: PropTypes.object.isRequired,
    configurationId: PropTypes.string.isRequired,
    filter: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    actionsProvisioning: PropTypes.object.isRequired
  },

  render() {
    return (
      <div className="kbc-container">
        <SearchRow
          query={this.props.filter}
          onChange={this.handleFilterChange}
          />
        <div className="list-group">
          <CreateQueryElement
            isNav={true}
            configurationId={this.props.configurationId}
            actionsProvisioning={this.props.actionsProvisioning}
            componentId={this.props.componentId}
          />
          {this.rows()}
        </div>
      </div>
    );
  },

  rows() {
    if (this.props.queries.count() > 0) {
      var navrows = [];
      if (this.props.newQueries) {
        navrows = this.props.newQueries.map(function(query) {
          let isEditing = false;
          let navQuery = query;
          if (this.props.editingQueries && this.props.editingQueries.has(query.get('id'))) {
            navQuery = this.props.editingQueries.get(query.get('id'));
            isEditing = true;
          }
          return (
            <NavRow
              key={navQuery.get('id')}
              query={navQuery}
              configurationId={this.props.configurationId}
              componentId={this.props.componentId}
              isEditing={isEditing}
            />
          );
        }, this).toArray();
      }
      var olnavrows = this.props.queries.map(function(query) {
        let navQuery = query;
        let isEditing = false;
        if (this.props.editingQueries && this.props.editingQueries.has(query.get('id'))) {
          navQuery = this.props.editingQueries.get(query.get('id'));
          isEditing = true;
        } else if (this.props.newQueries && this.props.newQueries.has(query.get('id'))) {
          navQuery = this.props.newQueries.get(query.get('id'));
          isEditing = true;
        }
        return (
          <NavRow
            key={navQuery.get('id')}
            query={navQuery}
            configurationId={this.props.configurationId}
            componentId={this.props.componentId}
            isEditing={isEditing}
          />
        );
      }, this).toArray();
      return navrows.concat(olnavrows);
    } else {
      return (
        <div className="list-group-item">
          No queries found.
        </div>
      );
    }
  },

  handleFilterChange(newQuery) {
    const actionCreators = this.props.actionsProvisioning.createActions(this.props.componentId);
    actionCreators.setQueriesFilter(this.props.configurationId, newQuery);
  }
});
