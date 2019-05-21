import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import { Map, fromJS } from 'immutable';
import { Badge } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import { getActivityMatchingData } from '../../../../react/admin/project-graph/GraphApi';
import StorageActionCreators from '../../../components/StorageActionCreators';
import ApplicationStore from '../../../../stores/ApplicationStore';
import ServicesStore from '../../../services/Store';
import ActivityMatchingModal from '../modals/ActivityMatchingModal';
import findMatches from './activity-matching/findMatches';

export default createReactClass({
  propTypes: {
    transformation: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      matches: Map(),
      isLoading: false,
      showModal: false
    };
  },

  componentDidMount() {
    if (!this.props.disabled) {
      this.loadDataAndRunSearch();
    }
  },

  render() {
    return (
      <a onClick={this.openModal} className={classnames({ 'text-muted': this.props.disabled })}>
        {this.renderIcon()} Activity Matching{' '}
        {!this.state.isLoading && <Badge>{this.state.matches.count()}</Badge>}
        <ActivityMatchingModal
          matches={this.state.matches}
          isLoading={this.state.isLoading}
          transformation={this.props.transformation}
          tables={this.props.tables}
          show={this.state.showModal}
          onHide={this.closeModal}
        />
      </a>
    );
  },

  renderIcon() {
    if (this.state.isLoading) {
      return <Loader className="fa-fw" />;
    }

    return <i className="fa fa-fw fa-align-justify" />;
  },

  openModal() {
    if (this.props.disabled) {
      return;
    }

    this.setState({ showModal: true });
  },

  closeModal() {
    this.setState({ showModal: false });
  },

  loadDataAndRunSearch() {
    const token = ApplicationStore.getSapiTokenString();
    const graphUrl = ServicesStore.getService('graph').get('url');

    this.setState({ isLoading: true });
    getActivityMatchingData(graphUrl, token)
      .then((result) => fromJS(result || []))
      .then((data) => {
        StorageActionCreators.activityMatchingDataLoaded(data);
        this.setState({ matches: findMatches(this.props.transformation, data) });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }
});
