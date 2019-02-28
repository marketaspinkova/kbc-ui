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
    return { 
      isLoading: TransformationBucketsStore.getIsLoading() 
    };
  },

  render() {
    if (this.props.allowRefresh) {
      return <RefreshIcon isLoading={this.state.isLoading} onClick={this.handleRefreshClick} />;
    }

    if (this.state.isLoading) {
      return <Loader />;
    }

    return null;
  },

  handleRefreshClick() {
    return InstalledComponentsActionCreators.loadComponentConfigsData('transformation');
  }
});
