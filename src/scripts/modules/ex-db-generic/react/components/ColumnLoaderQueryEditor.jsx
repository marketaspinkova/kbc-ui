import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Button, HelpBlock, FormControl } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import ApplicationStore from '../../../../stores/ApplicationStore';

export default createReactClass({
  propTypes: {
    componentId: PropTypes.string.isRequired,
    isLoadingColumns: PropTypes.bool.isRequired,
    columnSelector: PropTypes.object.isRequired,
    refreshMethod: PropTypes.func.isRequired
  },

  render() {
    if (this.props.isLoadingColumns) {
      return (
        <FormControl.Static>
          <Loader /> Fetching list of column
        </FormControl.Static>
      );
    }

    return (
      <div>
        {this.props.columnSelector}
        {this.showColumnsReloader() && (
          <HelpBlock>
            Not seeing all columns?{' '}
            <Button bsStyle="link" className="btn-link-inline" onClick={this.props.refreshMethod}>
              Reload
            </Button>{' '}
            the list of columns.
          </HelpBlock>
        )}
      </div>
    );
  },

  showColumnsReloader() {
    return (
      this.props.componentId === 'keboola.ex-db-pgsql' &&
      ApplicationStore.hasCurrentProjectFeature('pgsql-split-loading')
    );
  }
});
