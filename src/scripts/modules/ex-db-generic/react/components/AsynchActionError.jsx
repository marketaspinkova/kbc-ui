import PropTypes from 'prop-types';
import React from 'react';
import { Loader } from '@keboola/indigo-ui';
import { Alert } from 'react-bootstrap';

import { loadSourceTables } from '../../actionsProvisioning';

export default React.createClass({
  propTypes: {
    configId: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    connectionTesting: PropTypes.bool.isRequired,
    connectionError: PropTypes.string,
    sourceTablesLoading: PropTypes.bool.isRequired,
    sourceTablesError: PropTypes.string
  },

  render() {
    const {
      componentId,
      configId,
      sourceTablesError,
      sourceTablesLoading,
      connectionTesting,
      connectionError
    } = this.props;
    if (connectionError) {
      return (
        <Alert bsStyle="warning">
          <h4>Connecting to the database failed, please check the database credentials</h4>
          <p>{connectionError}</p>
          <p>
            {connectionTesting && (
              <span>
                <Loader /> Retrying the database connection
              </span>
            )}
          </p>
        </Alert>
      );
    } else if (sourceTablesError) {
      return (
        <Alert bsStyle="danger">
          <h4>An error occurred while fetching the list of tables</h4>
          <p>{sourceTablesError}</p>
          <p>
            {sourceTablesLoading ? (
              <span>
                <Loader /> Retrying fetch of the list of tables from the source database
              </span>
            ) : (
              <button
                className="btn btn-danger"
                onClick={() => loadSourceTables(componentId, configId)}
              >
                Try again
              </button>
            )}
          </p>
        </Alert>
      );
    }
    return null;
  }
});
