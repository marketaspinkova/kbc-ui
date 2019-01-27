import React, { PropTypes } from 'react';
import { Link } from 'react-router';

const COMPONENTS_WITH_QUERIES = [
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
  'ex-mongodb',
  'keboola.ex-google-bigquery',
  'keboola.ex-teradata'
];

export default React.createClass({
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
      return this.renderTransformationLink();
    }

    if (COMPONENTS_WITH_QUERIES.includes(this.props.componentId)) {
      return this.renderQueryLink();
    }

    return this.renderRowLink();
  },

  renderTransformationLink() {
    return (
      <Link
        className={this.props.className}
        to="transformationDetail"
        params={{
          config: this.props.configId,
          row: this.props.rowId
        }}
        query={this.props.query}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </Link>
    );
  },

  renderQueryLink() {
    return (
      <Link
        className={this.props.className}
        to={'ex-db-generic-' + this.props.componentId + '-query'}
        params={{
          config: this.props.configId,
          query: this.props.rowId
        }}
        query={this.props.query}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </Link>
    );
  },

  renderRowLink() {
    return (
      <Link
        className={this.props.className}
        to={this.props.componentId + '-row'}
        params={{
          config: this.props.configId,
          row: this.props.rowId
        }}
        query={this.props.query}
        onClick={this.props.onClick}
      >
        {this.props.children}
      </Link>
    );
  }
});
