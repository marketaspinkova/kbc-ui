import PropTypes from 'prop-types';
import React from 'react';
import { fromJS } from 'immutable';
import { Alert, Col, Modal, Form, FormGroup, FormControl, ControlLabel, Checkbox } from 'react-bootstrap';
import Select from 'react-select';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import Hint from '../../../../react/common/Hint';

const initialNewTableAlias = {
  destinationBucket: '',
  name: '',
  aliasFilter: {
    column: '',
    operator: 'eq',
    values: ''
  },
  aliasColumnsAutosync: true
};

export default React.createClass({
  propTypes: {
    buckets: PropTypes.object.isRequired,
    table: PropTypes.object.isRequired,
    sapiToken: PropTypes.object.isRequired,
    show: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    isSaving: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      newTableAlias: fromJS(initialNewTableAlias),
      tableColumns: this.props.table.get('columns').map(column => ({ label: column, value: column })).toArray(),
      error: null
    };
  },

  render() {
    return (
      <Modal bsSize="large" show={this.props.show} onHide={this.onHide}>
        <Form onSubmit={this.onSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>
              Create alias of {this.props.table.get('name')} table
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {this.renderError()}

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Destination bucket
              </Col>
              <Col sm={9}>
                <FormControl
                  autoFocus
                  componentClass="select"
                  value={this.state.newTableAlias.get('destinationBucket')}
                  onChange={this.handleDestinationBucket}
                >
                  <option value="">Select bucket...</option>
                  {this.allowedBuckets().map((bucket, index) => (
                    <option key={index} value={bucket.get('id')}>
                      {bucket.get('id')}
                    </option>
                  ))}
                </FormControl>
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Name
              </Col>
              <Col sm={9}>
                <FormControl type="text" value={this.state.newTableAlias.get('name')} onChange={this.handleName} />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Filtering{' '}
                <Hint title="Filtering">
                  <p>
                    You can specify one column to be filtered and comma separated values you&apos;re looking for. The alias
                    table will contain only these rows.
                  </p>
                </Hint>
              </Col>
              <Col sm={3}>
                <Select
                  clearable
                  placeholder="Column..."
                  value={this.state.newTableAlias.getIn(['aliasFilter', 'column'])}
                  onChange={this.handleAliasFilterColumn}
                  options={this.state.tableColumns}
                />
              </Col>
              <Col sm={3}>
                <FormControl
                  componentClass="select"
                  value={this.state.newTableAlias.getIn(['aliasFilter', 'operator'])}
                  onChange={this.handleAliasFilterOperator}
                >
                  <option value="eq">= (IN)</option>
                  <option value="ne">!= (NOT IN)</option>
                </FormControl>
              </Col>
              <Col sm={3}>
                <FormControl
                  type="text"
                  value={this.state.newTableAlias.getIn(['aliasFilter', 'values'])}
                  onChange={this.handleAliasFilterValues}
                />
              </Col>
            </FormGroup>

            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Columns{' '}
                <Hint title="Columns">
                  <p>By default columns are synchronized with source table.</p>
                  <p>
                    You can disable this behaviour and select only particular columns to be included in alias table.
                  </p>
                </Hint>
              </Col>
              <Col sm={9}>
                <Checkbox
                  checked={this.state.newTableAlias.get('aliasColumnsAutosync')}
                  onChange={this.toggleSyncColumns}
                >
                  Synchronize columns with source table
                </Checkbox>
              </Col>

              {!this.state.newTableAlias.get('aliasColumnsAutosync') && (
                <Col sm={9} smOffset={3}>
                  <Select.Creatable
                    placeholder="Select alias table columns..."
                    clearable={true}
                    multi={true}
                    value={this.state.newTableAlias.get('aliasColumns', [])}
                    onChange={this.handleAliasTableColumns}
                    options={this.state.tableColumns}
                  />
                </Col>
              )}
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={this.props.isSaving}
              isDisabled={this.isDisabled()}
              saveLabel="Create"
              onCancel={this.onHide}
              onSave={this.onSubmit}
              saveButtonType="submit"
            />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  renderError() {
    if (!this.state.error) {
      return null;
    }

    return <Alert bsStyle="danger">{this.state.error}</Alert>;
  },

  handleDestinationBucket(event) {
    this.setState({
      newTableAlias: this.state.newTableAlias.set('destinationBucket', event.target.value)
    });
  },

  handleAliasFilterOperator(event) {
    this.setState({
      newTableAlias: this.state.newTableAlias.setIn(['aliasFilter', 'operator'], event.target.value)
    });
  },

  handleAliasFilterColumn(option) {
    let newTableAlias = this.state.newTableAlias;

    if (option) {
      newTableAlias = newTableAlias.setIn(['aliasFilter', 'column'], option.value);
    } else {
      newTableAlias = newTableAlias.deleteIn(['aliasFilter', 'column']);
    }

    this.setState({ newTableAlias });
  },

  handleAliasFilterValues(event) {
    this.setState({
      newTableAlias: this.state.newTableAlias.setIn(['aliasFilter', 'values'], event.target.value)
    });
  },

  handleName(event) {
    this.setState({
      newTableAlias: this.state.newTableAlias.set('name', event.target.value)
    });
  },

  handleAliasTableColumns(selected) {
    const columns = selected.map(option => option.value);

    this.setState({
      newTableAlias: this.state.newTableAlias.set('aliasColumns', columns)
    });
  },

  allowedBuckets() {
    const permissions = this.props.sapiToken.get('bucketPermissions');
    const neededPermissions = ['write', 'manage'];
    const alowedStages = ['out', 'in'];

    return this.props.buckets
      .filter((bucket) => {
        const bucketPermission = permissions.get(bucket.get('id'), '');
        return neededPermissions.includes(bucketPermission) && alowedStages.includes(bucket.get('stage'));
      })
      .sortBy((bucket) => bucket.get('id').toLowerCase())
      .toArray();
  },

  toggleSyncColumns() {
    this.setState({
      newTableAlias: this.state.newTableAlias
        .update('aliasColumnsAutosync', aliasColumnsAutosync => !aliasColumnsAutosync)
        .set('aliasColumns', [])
    });
  },

  onHide() {
    this.props.onHide();
    this.resetState();
  },

  onSubmit(event) {
    event.preventDefault();
    const bucketId = this.state.newTableAlias.get('destinationBucket');
    const tableAlias = this.state.newTableAlias
      .update((tableAlias) => {
        if (!tableAlias.getIn(['aliasFilter', 'column'])) {
          return tableAlias.delete('aliasFilter');
        }
        return tableAlias.updateIn(['aliasFilter', 'values'], values => values.split(','))
      })
      .set('sourceTable', this.props.table.get('id'))
      .delete('destinationBucket')
      .toJS();

    this.setState({ error: null });
    this.props.onSubmit(bucketId, tableAlias).then(this.onHide, message => {
      this.setState({ error: message });
    });
  },

  resetState() {
    this.setState({
      newTableAlias: fromJS(initialNewTableAlias),
      error: null
    });
  },

  isDisabled() {
    const tableAlias = this.state.newTableAlias;
    const aliasFilter = tableAlias.get('aliasFilter');

    if (!tableAlias.get('name') || !tableAlias.get('destinationBucket')) {
      return true;
    }

    if (aliasFilter.get('column') && (!aliasFilter.get('operator') || !aliasFilter.get('values'))) {
      return true;
    }

    if (!tableAlias.get('aliasColumnsAutosync', true) && !tableAlias.get('aliasColumns', []).length) {
      return true;
    }

    return this.props.isSaving;
  }
});
