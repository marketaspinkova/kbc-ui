import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Map } from 'immutable';
import { Link } from 'react-router';
import { Button, Col, Row, Modal, Table, Label, Panel, Well } from 'react-bootstrap';
import { Loader, ExternalLink } from '@keboola/indigo-ui';
import RoutesStore from '../../../../stores/RoutesStore';
import Tooltip from '../../../../react/common/Tooltip';
import date from '../../../../utils/date';
import JobStatusLabel from '../../../../react/common/JobStatusLabel';
import TableUsagesLabel from '../components/TableUsagesLabel';
import TableSizeLabel from '../components/TableSizeLabel';

export default createReactClass({
  propTypes: {
    matches: PropTypes.object.isRequired,
    usages: PropTypes.object.isRequired,
    isLoading: PropTypes.bool.isRequired,
    transformation: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    tablesUsages: PropTypes.object.isRequired,
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

    return (
      <div>
        {this.renderInputMappingRows()}
        <br />
        {this.props.matches.count() > 0 ? (
          <p>
            Looks like someone already did transformation using same inputs before. Lets save time
            and reuse it.
          </p>
        ) : (
          <p>No relevant matches with same input mappings found.</p>
        )}
        {this.renderMatches()}
      </div>
    );
  },

  renderInputMappingRows() {
    if (!this.props.usages.count() || !this.props.tablesUsages.count()) {
      return null;
    }

    return this.props.transformation
      .get('input')
      .map((mapping, idx) => {
        const sourceTable = this.props.tables.get(mapping.get('source'), Map());
        const usage = this.props.usages.get(sourceTable.get('id'));

        if (!usage) {
          return null;
        }

        return (
          <Panel
            key={idx}
            collapsible
            header={
              <div>
                <TableUsagesLabel usages={this.props.tablesUsages.get(sourceTable.get('id'))} />
                {sourceTable.count() > 0 && (
                  <TableSizeLabel size={sourceTable.get('dataSizeBytes')} />
                )}{' '}
                {mapping.get('source')}
              </div>
            }
          >
            <Table className="table-no-margin" fill striped responsive hover>
              <thead>
                <tr>
                  <th>Bucket</th>
                  <th>Transformation</th>
                  <th>Last run</th>
                  <th>Last run status</th>
                </tr>
              </thead>
              <tbody>
                {usage.map((row) => {
                  return (
                    <tr key={row.get('rowId')}>
                      <td>{this.renderTransformationBucketLink(row)}</td>
                      <td>{this.renderTransformationLink(row)}</td>
                      <td>{this.renderLastRun(row)}</td>
                      <td>
                        {row.has('lastRunStatus') && (
                          <JobStatusLabel status={row.get('lastRunStatus')} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Panel>
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
                    {config.get('configurationName')} - {config.get('rowName')} #
                    {config.get('rowVersion')}
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
                <Button disabled bsStyle="success" bsSize="large">
                  Show data results (private beta)
                </Button>
              </Col>
            </Row>
          </Well>
        );
      })
      .toArray();
  },

  renderTransformationBucketLink(row) {
    const createdAt = date.format(row.get('configurationCreatedAt'));
    const createdBy = row.get('configurationCreated');

    return (
      <Link to="transformationBucket" params={{ config: row.get('configurationId') }}>
        <Tooltip tooltip={`Created ${createdAt} by ${createdBy}`} placement="top">
          <span>{row.get('configurationName')}</span>
        </Tooltip>
      </Link>
    );
  },

  renderTransformationLink(row) {
    const lastModifiedAt = date.format(row.get('configurationCreatedAt'));
    const lastModifiedBy = row.get('configurationCreated');

    if (this.props.transformation.get('id') === row.get('rowId')) {
      return (
        <Tooltip tooltip={`Last edit ${lastModifiedAt} by ${lastModifiedBy}`} placement="top">
          <span>
            {row.get('rowName')} <Label>Current</Label>
          </span>
        </Tooltip>
      );
    }

    return (
      <Link
        to="transformationDetail"
        params={{ row: row.get('rowId'), config: row.get('configurationId') }}
      >
        <Tooltip tooltip={`Last edit ${lastModifiedAt} by ${lastModifiedBy}`} placement="top">
          <span>{row.get('rowName')}</span>
        </Tooltip>
      </Link>
    );
  },

  renderLastRun(row) {
    if (!row.has('lastRunAt')) {
      return <span>Never runned</span>;
    }

    return (
      <Tooltip tooltip={`Triggered by ${row.get('lastRunBy')}`} placement="top">
        <span>{date.format(row.get('lastRunAt'))}</span>
      </Tooltip>
    );
  },

  goToTransformation(config) {
    this.props.onHide();
    RoutesStore.getRouter().transitionTo('transformationDetail', {
      config: config.get('configurationId'),
      row: config.get('rowId')
    });
  }
});
