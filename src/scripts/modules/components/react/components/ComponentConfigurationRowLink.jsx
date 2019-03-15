import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Link } from 'react-router';

const ExDbGenericComponents = [
  'keboola.ex-db-pgsql',
  'keboola.ex-db-redshift',
  'keboola.ex-db-redshift-cursors',
  'keboola.ex-db-firebird',
  'keboola.ex-db-db2',
  'keboola.ex-db-db2-bata',
  'keboola.ex-db-mssql',
  'keboola.ex-db-mysql',
  'keboola.ex-db-mysql-custom',
  'keboola.ex-db-oracle',
  'keboola.ex-db-snowflake',
  'keboola.ex-db-impala',
  'keboola.ex-google-bigquery',
  'keboola.ex-teradata'
];

const ExAnalyticsComponents = [
  'ex-google-analytics',
  'ex-google-analytics-v4',
  'ex-google-analytics-v5'
];

export default createReactClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    configId: PropTypes.string.isRequired,
    rowId: PropTypes.string.isRequired,
    className: PropTypes.string,
    query: PropTypes.object,
    children: PropTypes.node.isRequired,
    onClick: PropTypes.func
  },

  render() {
    if (this.props.componentId === 'transformation') {
      return this.renderLink('transformationDetail', {
        config: this.props.configId,
        row: this.props.rowId
      });
    }

    if (ExAnalyticsComponents.includes(this.props.componentId)) {
      return this.renderLink(this.props.componentId + '-query-detail', {
        config: this.props.configId,
        queryId: this.props.rowId
      });
    }

    if (ExDbGenericComponents.includes(this.props.componentId)) {
      return this.renderLink('ex-db-generic-' + this.props.componentId + '-query', {
        config: this.props.configId,
        query: this.props.rowId
      });
    }

    if (this.props.componentId === 'ex-mongodb') {
      return this.renderLink(this.props.componentId + '-query', {
        config: this.props.configId,
        query: this.props.rowId
      });
    }

    return this.renderLink(this.props.componentId + '-row', {
      config: this.props.configId,
      row: this.props.rowId
    });
  },

  renderLink(to, params) {
    return (
      <Link
        className={this.props.className}
        query={this.props.query}
        onClick={this.props.onClick}
        to={to}
        params={params}
      >
        {this.props.children}
      </Link>
    );
  }
});
