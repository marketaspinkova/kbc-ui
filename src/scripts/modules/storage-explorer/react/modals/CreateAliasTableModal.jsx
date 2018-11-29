import React, { PropTypes } from 'react';
import { fromJS } from 'immutable';
import { Col, Modal, Form, FormGroup, FormControl, ControlLabel, Checkbox } from 'react-bootstrap';
import Select from 'react-select';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import Hint from '../../../../react/common/Hint';

const initialNewTableAlias = {
  sourceTable: '',
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
    bucket: PropTypes.object.isRequired,
    tables: PropTypes.object.isRequired,
    openModal: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    isSaving: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      newTableAlias: fromJS(initialNewTableAlias),
      tableColumns: []
    };
  },

  render() {
    return (
      <Modal bsSize="large" show={this.props.openModal} onHide={this.onHide} enforceFocus={false}>
        <Form onSubmit={this.onSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Create table alias in {this.props.bucket.get('id')}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormGroup>
              <Col sm={3} componentClass={ControlLabel}>
                Source table
              </Col>
              <Col sm={9}>
                <FormControl
                  componentClass="select"
                  onChange={this.handleSourceTable}
                  value={this.state.newTableAlias.get('sourceTable')}
                >
                  <option value="" disabled>
                    Select source table...
                  </option>
                  {this.tablesGrouped()
                    .map((group, groupName) => (
                      <optgroup label={groupName} key={groupName}>
                        {group
                          .map(option => (
                            <option value={option.get('id')} key={option.get('id')}>
                              {option.get('id')}
                            </option>
                          ))
                          .toArray()}
                      </optgroup>
                    ))
                    .toArray()}
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
                    You can specify one column to be filtered and comma separated values you're looking for. The alias
                    table will contain only these rows.
                  </p>
                </Hint>
              </Col>
              <Col sm={3}>
                <Select
                  clearable={false}
                  placeholder="Column..."
                  value={this.state.newTableAlias.getIn(['aliasFilter', 'column'])}
                  onChange={this.handleAliasFilterColumn}
                  options={this.state.tableColumns}
                  disabled={this.state.tableColumns.length === 0}
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
                    disabled={this.state.tableColumns.length === 0}
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

  tablesGrouped() {
    return this.props.tables
      .filter(table => {
        const bucket = table.get('bucket');
        return bucket.get('stage') !== 'sys' && this.props.bucket.get('backend') === bucket.get('backend');
      })
      .groupBy(table => {
        return table.getIn(['bucket', 'id']);
      });
  },

  handleSourceTable(event) {
    const table = this.props.tables.find(item => item.get('id') === event.target.value);
    const columns = table
      .get('columns')
      .map(column => ({
        label: column,
        value: column
      }))
      .toArray();

    this.setState({
      tableColumns: columns,
      newTableAlias: this.state.newTableAlias.set('sourceTable', event.target.value).remove('aliasColumns')
    });
  },

  handleAliasFilterOperator(event) {
    this.setState({
      newTableAlias: this.state.newTableAlias.setIn(['aliasFilter', 'operator'], event.target.value)
    });
  },

  handleAliasFilterColumn(option) {
    this.setState({
      newTableAlias: this.state.newTableAlias.setIn(['aliasFilter', 'column'], option.value)
    });
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
    const bucketId = this.props.bucket.get('id');
    const tableAlias = this.state.newTableAlias.updateIn(['aliasFilter', 'values'], values => values.split(',')).toJS();
    this.props.onSubmit(bucketId, tableAlias).then(this.onHide);
  },

  resetState() {
    this.setState({
      newTableAlias: fromJS(initialNewTableAlias),
      tableColumns: []
    });
  },

  isDisabled() {
    const tableAlias = this.state.newTableAlias;
    const aliasFilter = tableAlias.get('aliasFilter');

    if (!tableAlias.get('name') || !tableAlias.get('sourceTable')) {
      return true;
    }

    if (!aliasFilter.get('column') || !aliasFilter.get('operator') || !aliasFilter.get('values')) {
      return true;
    }

    if (!tableAlias.get('aliasColumnsAutosync', false) && !tableAlias.get('aliasColumns')) {
      return true;
    }

    return this.props.isSaving;
  }
});
