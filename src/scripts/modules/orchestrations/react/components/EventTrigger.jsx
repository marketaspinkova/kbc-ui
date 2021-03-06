import React from 'react';
import {Button, Col, ControlLabel, FormControl, FormGroup, HelpBlock, InputGroup, Table} from 'react-bootstrap';
import PropTypes from 'prop-types';
import Select from 'react-select';
import CreatedDate from '../../../../react/common/CreatedDate';
import Tooltip from '../../../../react/common/Tooltip';
import SapiTableLink from '../../../components/react/components/StorageApiTableLink';

class EventTrigger extends React.Component {
  render() {
    const selectedTables = this._getSelectedTables(this.props.selected);
    if (!selectedTables.count()) {
      return (
        <div>
          <div className="text-muted text-center kbc-inner-padding">
            <i className="fa fa-4x fa-table" />
            <p>Add tables from Storage</p>
          </div>
          {this.renderAddTableForm()}
        </div>
      );
    }
    return (
      <div>
        {this.renderTables(selectedTables)}
        {this.renderAddTableForm()}
        {this.renderPeriodSelect()}
      </div>
    );
  }

  renderAddTableForm() {
    return (
      <FormGroup>
        <Select
          options={this._getTables()}
          onChange={item => this.props.onAddTable(item.value)}
          placeholder="Add table..."
          clearable={false}
          deleteRemoves={false}
          backspaceRemoves={false}
        />
      </FormGroup>
    );
  }

  renderTables(tables) {
    return (
      <div>
        <HelpBlock>
        Orchestration will start each time all of these tables are updated
        </HelpBlock>
        <Table striped hover>
          <thead>
          <tr>
            <th>Table</th>
            <th>Last Import</th>
            <th> </th>
          </tr>
          </thead>
          <tbody>
          {tables.valueSeq().map((item, index) => {
            return (
              <tr key={index}>
                <td className="kbc-break-all kbc-break-word">
                  <SapiTableLink tableId={item.get('id')}>
                    {item.get('id')}
                  </SapiTableLink>
                </td>
                <td>
                  {item.get('lastImportDate') ? (
                    <CreatedDate createdTime={item.get('lastImportDate')} />
                  ) : (
                    'Not yet imported'
                  )}
                </td>
                <td>
                  <Tooltip placement="top" tooltip="Remove table">
                    <Button bsStyle="link" onClick={() => this.props.onRemoveTable(item.get('id'))}>
                      <i className="fa fa-trash-o" />
                    </Button>
                  </Tooltip>
                </td>
              </tr>
            );
          })}
          </tbody>
        </Table>
      </div>
    );
  }

  renderPeriodSelect() {
    return (
      <div className="form-horizontal">
        <FormGroup validationState={this.props.isPeriodValid()}>
          <Col componentClass={ControlLabel} sm={6}>
            Cooldown period
          </Col>
          <Col sm={6} >
            <InputGroup>
              <FormControl
                id="periodValue"
                type="text"
                value={this.props.period}
                onChange={this.props.onChangePeriod}
              />
              <InputGroup.Addon>Minutes</InputGroup.Addon>
            </InputGroup>
            <FormControl.Feedback />
            <HelpBlock>
              If event was triggered, it could only be triggered again after this time period.
              <br /> Minimum is 5 minutes.
            </HelpBlock>
          </Col>
        </FormGroup>
      </div>
    );
  }

  _getTables() {
    const selected = this.props.selected;
    const availableTables = this.props.tables.filter(table => !selected.includes(table.get('id')));

    return availableTables.map(table => ({
      label: table.get('id'),
      value: table.get('id')
    })).toArray();
  }

  _getSelectedTables(selectedOptions) {
    return this.props.tables.filter(table => selectedOptions.includes(table.get('id')));
  }
}

EventTrigger.propTypes = {
  tables: PropTypes.object.isRequired,
  selected: PropTypes.array,
  onAddTable: PropTypes.func.isRequired,
  onRemoveTable: PropTypes.func.isRequired,
  period: PropTypes.string.isRequired,
  onChangePeriod: PropTypes.func.isRequired,
  isPeriodValid: PropTypes.func.isRequired
};

export default EventTrigger;
