import React, {PropTypes} from 'react';

import {FormGroup, FormControl, Form, ControlLabel, Col, Checkbox, HelpBlock, Accordion, Panel} from 'react-bootstrap';
import CsvDelimiterInput from '../../../react/common/CsvDelimiterInput';
import SaveButtons from '../../../react/common/SaveButtons';
import Select from '../../../react/common/Select';

export default React.createClass({

  propTypes: {
    requestedEmail: PropTypes.string.isRequired,
    incremental: PropTypes.bool.isRequired,
    delimiter: PropTypes.string.isRequired,
    enclosure: PropTypes.string.isRequired,
    primaryKey: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    actions: PropTypes.object.isRequired,
    localState: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      accordionActiveTab: 'settings'
    };
  },

  onChangeDelimiter(value) {
    this.props.onChange('delimiter', value);
  },

  onChangeEnclosure(e) {
    this.props.onChange('enclosure', e.target.value);
  },

  onChangeIncremental() {
    this.props.onChange('incremental', !this.props.incremental);
  },

  onChangePrimaryKey(value) {
    this.props.onChange('primaryKey', value);
  },

  renderButtons() {
    if (this.props.requestedEmail) {
      return (
        <div className="text-right">
          <SaveButtons
            isSaving={this.props.localState.get('isSaving', false)}
            isChanged={this.props.localState.get('isChanged', false)}
            onSave={this.props.actions.editSave}
            onReset={this.props.actions.editReset}
          />
        </div>
      );
    }
  },

  accordionArrow(isActive) {
    if (isActive) {
      return (<span className="fa fa-fw fa-angle-down" />);
    }
    return (<span className="fa fa-fw fa-angle-right" />);
  },

  accordionHeader(label, isActive) {
    return (
      <h4>
        {this.accordionArrow(isActive)}
        {label}
      </h4>
    );
  },

  render() {
    const component = this;
    return (
      <Accordion
        className="kbc-accordion"
        onSelect={function(activeTab) {
          if (activeTab === component.state.accordionActiveTab) {
            component.setState({accordionActiveTab: null});
          } else {
            component.setState({accordionActiveTab: activeTab});
          }
        }}
        defaultActiveKey="settings"
      >
        <Panel
          header={this.accordionHeader('Import Settings', this.state.accordionActiveTab === 'settings')}
          eventKey="settings"
        >
          <Form horizontal>
            {this.renderButtons()}
            <br/>
            <CsvDelimiterInput
              placeholder="Field delimeter used in CSV files"
              label="Delimiter"
              value={this.props.delimiter}
              onChange={this.onChangeDelimiter}
              help={(
                <span>Field delimiter used in the CSV file. The default value is <code>,</code>. Use <code>\t</code> for tabulator.</span>)}
              disabled={false}
            />
            <FormGroup>
              <Col componentClass={ControlLabel} sm={4}>
                Enclosure
              </Col>
              <Col sm={8}>
                <FormControl
                  type="text"
                  placeholder="Field enclosure used in the CSV files"
                  value={this.props.enclosure}
                  onChange={this.onChangeEnclosure}
                />
                <HelpBlock>Field enclosure used in the CSV file. The default value is <code>&quot;</code>.</HelpBlock>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col componentClass={ControlLabel} sm={4}>
                Primary Key
              </Col>
              <Col sm={8}>
                <Select
                  name="primaryKey"
                  value={this.props.primaryKey}
                  multi={true}
                  allowCreate={true}
                  delimiter=","
                  placeholder="Add a column"
                  emptyStrings={false}
                  onChange={this.onChangePrimaryKey}
                />
                <HelpBlock>Primary key of the table. If a primary key is set, updates can be done on the table by selecting <strong>incremental loads</strong>. The primary key can consist of multiple columns.</HelpBlock>
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={8} smPush={4}>
                <Checkbox
                  checked={this.props.incremental}
                  onChange={this.onChangeIncremental}>
                  Incremental load
                </Checkbox>
                <HelpBlock>If incremental load is turned on, the table will be updated instead of rewritten. Tables with
                  a primary key will have rows updated, tables without a primary key will have rows appended.</HelpBlock>
              </Col>
            </FormGroup>
          </Form>
        </Panel>
      </Accordion>
    );
  }
});
