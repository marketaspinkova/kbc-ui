import React from 'react';
import {Button, Col, ControlLabel, FormControl, FormGroup, HelpBlock, InputGroup, Table} from 'react-bootstrap';
import PropTypes from 'prop-types';
import Select from 'react-select';
import moment from 'moment';
import date from '../../../../utils/date';
import Tooltip from '../../../../react/common/Tooltip';
import SapiTableLinkEx from '../../../components/react/components/StorageApiTableLinkEx';

function renderEmptyIcon() {
  return (
    <div className="text-muted" style={{textAlign: 'center'}}>
      <i className="fa fa-fw fa-table" style={{fontSize: '60px'}} />
      <p>Add tables from Storage</p>
    </div>
  );
}

class EventTrigger extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const selectedTables = this._getSelectedTables(this.props.selected);
    return (
      <div>
        {selectedTables.count() ? this.renderTables(selectedTables) : renderEmptyIcon()}
        {this.renderAddTableForm()}
        {selectedTables.count() ? this.renderPeriodSelect() : null}
      </div>
    );
  }

  renderAddTableForm() {
    const options = this._getTables();
    return (
      <form className="form-horizontal">
        <FormGroup>
          <Col sm={12}>
            <Select
              name="selectTables"
              multi={false}
              options={options}
              delimiter=","
              onChange={item => this.props.onAddTable(item.value)}
              placeholder="Add tables..."
              clearable={true}
            />
          </Col>
        </FormGroup>
      </form>
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
            <th> </th>
            <th>Table</th>
            <th>Last Import</th>
            <th> </th>
          </tr>
          </thead>
          <tbody>
          {tables.valueSeq().map((item, index) => {
            return (
              <tr key={index}>
                <td><i className="fa fa-fw fa-table" /></td>
                <td className="kbc-break-all kbc-break-word">
                  <SapiTableLinkEx tableId={item.get('id')} />
                </td>
                <td>
                  <span title={moment(item.get('lastImportDate')).fromNow()}>
                    {date.format(item.get('lastImportDate'))}
                  </span>
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
      <form className="form-horizontal">
        <FormGroup validationState={this._getValidationState()}>
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
      </form>
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

  _getValidationState() {
    return this.props.period < 5 ? 'error' : null;
  }
}

EventTrigger.propTypes = {
  tables: PropTypes.object.isRequired,
  selected: PropTypes.array,
  onAddTable: PropTypes.func.isRequired,
  onRemoveTable: PropTypes.func.isRequired,
  period: PropTypes.string.isRequired,
  onChangePeriod: PropTypes.func.isRequired
};

export default EventTrigger;
