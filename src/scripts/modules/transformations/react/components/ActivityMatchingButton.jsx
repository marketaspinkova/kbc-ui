import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import { Map, fromJS } from 'immutable';
import { Badge, Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import { getActivityMatchingData } from '../../../../react/admin/project-graph/GraphApi';
import StorageActionCreators from '../../../components/StorageActionCreators';
import ApplicationStore from '../../../../stores/ApplicationStore';
import ServicesStore from '../../../services/Store';
import ActivityMatchingModal from '../modals/ActivityMatchingModal';
import findMatches from './activity-matching/findMatches';
import findUsages from './activity-matching/findUsages';

export default createReactClass({
  propTypes: {
    transformation: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    tablesUsages: PropTypes.object.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      matches: Map(),
      usages: Map(),
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
      <Button
        bsStyle="link"
        onClick={this.openModal}
        className={classnames({ 'text-muted': this.props.disabled }, 'btn-block')}
      >
        {this.renderIcon()} Activity Matching{' '}
        {!this.state.isLoading && <Badge>{this.state.matches.count()}</Badge>}
        <ActivityMatchingModal
          matches={this.state.matches}
          usages={this.state.usages}
          isLoading={this.state.isLoading}
          transformation={this.props.transformation}
          tables={this.props.tables}
          tablesUsages={this.props.tablesUsages}
          show={this.state.showModal}
          onHide={this.closeModal}
        />
      </Button>
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
        this.setState({ 
          matches: findMatches(this.props.transformation, data),
          usages: findUsages(this.props.transformation, data)
        });
      })
      .finally(() => {
        this.setState({ isLoading: false });
      });
  }
});
