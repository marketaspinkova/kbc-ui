import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Loader } from '@keboola/indigo-ui';
import { Link } from 'react-router';
import RefreshTables from './RefreshTables';

export default createReactClass({
  propTypes: {
    componentId: PropTypes.string,
    configId: PropTypes.string.isRequired,
    isLoadingSourceTables: PropTypes.bool.isRequired,
    isTestingConnection: PropTypes.bool.isRequired,
    validConnection: PropTypes.bool.isRequired,
    tableSelectorElement: PropTypes.object.isRequired,
    refreshMethod: PropTypes.func.isRequired
  },

  render() {
    const { componentId, configId, isLoadingSourceTables, isTestingConnection, validConnection, tableSelectorElement } = this.props;
    if (isTestingConnection) {
      return (
        <div className="form-control-static">
          <Loader/> Asserting connection validity
        </div>
      );
    } else if (!validConnection) {
      return (
        <div className="form-control-static">
          <div className="warning"> Failed making database connection, please check your
            {' '}
            <Link
              to={'ex-db-generic-' + componentId + '-credentials'}
              params={{config: configId}}
            >
              credentials
            </Link>.
          </div>
        </div>
      );
    } else if (isLoadingSourceTables) {
      return (
        <div className="form-control-static">
          <Loader/> Fetching list of tables from source database
        </div>
      );
    }
    if (validConnection && !isLoadingSourceTables) {
      return (
        <div>
          {tableSelectorElement}
          <RefreshTables refresh={this.props.refreshMethod} />
        </div>
      );
    }
    return tableSelectorElement;
  }
});
