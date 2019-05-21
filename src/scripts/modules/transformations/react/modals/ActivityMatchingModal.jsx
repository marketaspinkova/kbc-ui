import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';
import { Button, Col, Row, Modal, Well } from 'react-bootstrap';
import { Loader, ExternalLink } from '@keboola/indigo-ui';
import RoutesStore from '../../../../stores/RoutesStore';

import date from '../../../../utils/date';
import JobStatusLabel from '../../../../react/common/JobStatusLabel';
import TableSizeLabel from '../components/TableSizeLabel';

export default createReactClass({
  propTypes: {
    matches: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    transformation: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    onHide: PropTypes.func.isRequired
  },

  render() {
    return (
      <Modal bsSize="large" show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="fa fa-fw fa-align-justify" /> Activity Matching
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>{this.renderBody()}</Modal.Body>
      </Modal>
    );
  },

  renderBody() {
    if (this.props.isLoading) {
      return (
        <p>
          <Loader /> searching matches
        </p>
      );
    }

    if (!this.props.matches.count()) {
      return <p>No relevant matches with same input mappings found.</p>;
    }

    return (
      <div>
        <p>
          Looks like someone already did transformation using same inputs before. Lets save time and
          reuse it.
        </p>
        {this.renderInputMappingRows()}
        <br />
        {this.renderMatches()}
      </div>
    );
  },

  renderInputMappingRows() {
    return this.props.transformation
      .get('input')
      .map((mapping, idx) => {
        const sourceTable = this.props.tables.get(mapping.get('source'), Map());

        return (
          <Well key={idx} style={{ marginBottom: '5px' }}>
            {sourceTable.count() > 0 && <TableSizeLabel size={sourceTable.get('dataSizeBytes')} />}{' '}
            {mapping.get('source')}
          </Well>
        );
      })
      .toArray();
  },

  renderMatches() {
    return this.props.matches
      .map((match, idx) => {
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
                <p style={{ margin: '0 0 5px' }}>
                  Last run: {date.format(config.get('lastRunAt'))}
                </p>
                <p>Last edit: {date.format(config.get('rowLastModifiedAt'))}</p>
              </Col>
            </Row>
          </Well>
        );
      })
      .toArray();
  },

  goToTransformation(config) {
    this.props.onHide();
    RoutesStore.getRouter().transitionTo('transformationDetail', {
      config: config.get('configurationId'),
      row: config.get('rowId')
    });
  }
});