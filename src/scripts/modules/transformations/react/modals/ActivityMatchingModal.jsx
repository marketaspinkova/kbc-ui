import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Map, fromJS } from 'immutable';
import { Button, Col, Row, Modal, Well } from 'react-bootstrap';
import { Loader, ExternalLink } from '@keboola/indigo-ui';
import RoutesStore from '../../../../stores/RoutesStore';
import ApplicationStore from '../../../../stores/ApplicationStore';
import date from '../../../../utils/date';
import request from '../../../../utils/request';
import JobStatusLabel from '../../../../react/common/JobStatusLabel';
import TableSizeLabel from '../components/TableSizeLabel';

const INITIAL_STATE = {
  data: Map(),
  matches: Map(),
  isLoading: false
};

export default createReactClass({
  propTypes: {
    transformation: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  render() {
    return (
      <Modal
        bsSize="large"
        show={this.props.show}
        onHide={this.onHide}
        onEntering={this.loadDataAndRunSearch}
        onExit={this.onHide}
      >
        <Modal.Header closeButton>
          <Modal.Title>Activity Matching</Modal.Title>
        </Modal.Header>
        <Modal.Body>{this.renderBody()}</Modal.Body>
      </Modal>
    );
  },

  renderBody() {
    if (this.state.isLoading) {
      return (
        <p>
          <Loader /> searching matches
        </p>
      );
    }

    if (!this.state.matches.count()) {
      return <p>No matches with same input mappings found.</p>;
    }

    return (
      <div>
        <p>
          Looks like someone already did transformation using same inputs before. Lets save time and
          reuse it.
        </p>
        {this.props.transformation
          .get('input')
          .map(this.renderInputMappingRow)
          .toArray()}
        <br />
        {this.state.matches.map(this.renderMatch).toArray()}
      </div>
    );
  },

  renderInputMappingRow(mapping, idx) {
    const sourceTable = this.props.tables.get(mapping.get('source'), Map());

    return (
      <Well key={idx} style={{ marginBottom: '5px' }}>
        {sourceTable.count() > 0 && <TableSizeLabel size={sourceTable.get('dataSizeBytes')} />}{' '}
        {mapping.get('source')}
      </Well>
    );
  },

  renderMatch(match, idx) {
    const config = match.first();

    return (
      <Well key={idx}>
        <Row>
          <Col sm={6}>
            <p style={{ margin: '0 0 5px', display: 'flex', alignItems: 'center' }}>
              <strong style={{ fontSize: '1.2em', marginRight: '10px' }}>
                {config.get('rowName')} #{config.get('rowVersion')}
              </strong>{' '}
              <JobStatusLabel status={config.get('lastRunStatus')} />
            </p>
            <p>
              <ExternalLink href={`mailto:${config.get('configurationCreated')}`}>
                {config.get('configurationCreated')}
              </ExternalLink>
            </p>
            <Button
              bsStyle="default"
              bsSize="large"
              onClick={() => this.goToTransformation(config)}
            >
              Check this transformation
            </Button>
          </Col>
          <Col sm={6} className="text-right text-muted">
            <p style={{ margin: '0 0 5px' }}>Last run: {date.format(config.get('lastRunAt'))}</p>
            <p>Last edit: {date.format(config.get('rowLastModifiedAt'))}</p>
          </Col>
        </Row>
      </Well>
    );
  },

  loadDataAndRunSearch() {
    this.setState({ isLoading: true });
    request('GET', 'https://p7pjgem0zb.execute-api.eu-west-1.amazonaws.com/dev/project/match')
      .set('X-StorageApi-Token', ApplicationStore.getSapiTokenString())
      .promise()
      .then((response) => {
        this.setState({ data: fromJS(response.body), isLoading: false });
      })
      .then(this.findMatches)
      .finally(() => {
        this.setState({ isLoading: false });
      });
  },

  findMatches() {
    const sources = this.props.transformation
      .get('input')
      .map((mapping) => mapping.get('source'))
      .toSet()
      .toList();
    const tables = this.state.data
      .filter((row) => sources.includes(row.get('table')))
      .map((row) => row.get('usedIn'));

    if (sources.count() > tables.count()) {
      return;
    }

    const matches = tables
      .flatten(1)
      .filter((row) => row.get('rowId') !== this.props.transformation.get('id'))
      .groupBy((row) => row.get('rowId'))
      .filter((configuration) => configuration.count() === sources.count())
      .sortBy((configuration) => {
        const lastRun = configuration.first().get('lastRunAt');
        return -1 * new Date(lastRun).getTime();
      })
      .sortBy((configuration) => {
        const status = configuration.first().get('lastRunStatus');
        if (status === 'success') return -1;
        if (status === 'error' || status === 'terminated') return 1;
        return 0;
      })
      .slice(0, 3);

    this.setState({ matches });
  },

  onHide() {
    this.setState(INITIAL_STATE);
    this.props.onHide();
  },

  goToTransformation(config) {
    this.onHide();
    RoutesStore.getRouter().transitionTo('transformationDetail', {
      config: config.get('configurationId'),
      row: config.get('rowId')
    });
  }
});
