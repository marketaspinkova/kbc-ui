import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import { Map, fromJS } from 'immutable';
import { Badge } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import { getActivityMatchingData } from '../../../../react/admin/project-graph/GraphApi';
import ApplicationStore from '../../../../stores/ApplicationStore';
import ServicesStore from '../../../services/Store';
import ActivityMatchingModal from '../modals/ActivityMatchingModal';

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
    this.loadDataAndRunSearch();
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
      .then((data) => this.findMatches(fromJS(data || [])))
      .finally(() => {
        this.setState({ isLoading: false });
      });
  },

  findMatches(data) {
    const sources = this.props.transformation
      .get('input')
      .map((mapping) => mapping.get('source'))
      .toSet()
      .toList();
    const tables = data
      .filter((row) => sources.includes(row.get('inputTable')))
      .map((row) => row.get('usedIn'));

    if (sources.count() > tables.count()) {
      return;
    }

    const matches = tables
      .flatten(1)
      .filter((row) => row.get('rowId') !== this.props.transformation.get('id'))
      .groupBy((row) => row.get('rowId'))
      .filter((configuration) => configuration.count() === sources.count())
      .filter((configuration) => configuration.first().get('lastRunAt'))
      .sortBy((configuration) => {
        const lastRun = configuration.first().get('lastRunAt');
        return -1 * new Date(lastRun).getTime();
      })
      .sortBy((configuration) => {
        const status = configuration.first().get('lastRunStatus');
        if (status === 'success') return -1;
        if (status === 'error' || status === 'terminated') return 1;
        return 0;
      });

    this.setState({ matches });
  }
});
