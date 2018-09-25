import React from 'react';

import createStoreMixin from '../../../../react/mixins/createStoreMixin';
import InstalledComponentsActionCreators from '../../../components/InstalledComponentsActionCreators';
import TransformationBucketsStore from '../../stores/TransformationBucketsStore';
import { RefreshIcon, Loader } from '@keboola/indigo-ui';

export default React.createClass({
  mixins: [createStoreMixin(TransformationBucketsStore)],

  propTypes: {
    allowRefresh: React.PropTypes.bool
  },

  getDefaultProps() {
    return { allowRefresh: false };
  },

  getStateFromStores() {
    return { isLoading: TransformationBucketsStore.getIsLoading() };
  },

  _handleRefreshClick() {
    return InstalledComponentsActionCreators.loadComponentConfigsData('transformation');
  },

  render() {
    if (this.props.allowRefresh) {
      return <RefreshIcon isLoading={this.state.isLoading} onClick={this._handleRefreshClick} />;
    }

    if (this.state.isLoading) {
      return <Loader />;
    }

    return null;
  }
});
