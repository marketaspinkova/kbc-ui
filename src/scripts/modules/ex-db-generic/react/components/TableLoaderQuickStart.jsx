import PropTypes from 'prop-types';
import React from 'react';
import {Loader} from '@keboola/indigo-ui';
import {Link} from 'react-router';

export default React.createClass({
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
        <div>
          <Loader/> Asserting connection validity
        </div>
      );
    } else if (!validConnection) {
      return (
        <div>
          <Link
            to={'ex-db-generic-' + componentId + '-credentials'}
            params={{config: configId}}
            className="btn btn-success"
          >
            Update Credentials
          </Link>
        </div>
      );
    } else if (isLoadingSourceTables) {
      return (
        <div>
          <Loader/> Fetching table list from source database
        </div>
      );
    }
    if (validConnection && !isLoadingSourceTables) {
      return (
        <div>
          {tableSelectorElement}
          <div className="help-block">
            Not seeing your newest tables?
            {' '}
            <a
              onClick={(e) => {
                e.preventDefault();
                this.props.refreshMethod();
              }}
            >
              Reload
            </a>
            {' '}
            the tables list.
          </div>
        </div>
      );
    }
    return tableSelectorElement;
  }
});
