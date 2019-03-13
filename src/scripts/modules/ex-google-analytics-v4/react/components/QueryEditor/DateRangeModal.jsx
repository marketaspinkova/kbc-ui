import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import { Button, Modal, Tabs, Tab, Form, FormGroup, FormControl, ControlLabel, Col } from 'react-bootstrap';
import DateTime from 'react-datetime';

const DATE_FORMAT = 'YYYY-MM-DD';
const SUGGESTIONS = {
  Today: {
    start: 'today',
    end: 'tomorrow -1 second'
  },
  'Last 7 days': {
    start: '-7 days',
    end: 'today'
  },
  'Last 2 Months': {
    start: '-2 months',
    end: 'today'
  },
  'Last 2 Weeks': {
    start: '-2 weeks',
    end: 'today'
  },
  'Last Month': {
    start: 'midnight first day of last month',
    end: 'midnight last day of last month'
  },
  'This Month': {
    start: 'midnight first day of this month',
    end: 'midnight last day of this month'
  },
  'Last Week': {
    start: 'monday last week',
    end: 'sunday last week'
  },
  'This Week': {
    start: 'monday this week',
    end: 'today'
  }
};

export default React.createClass({
  propTypes: {
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    onSet: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
  },

  getInitialState() {
    return this.getStateFromProps(this.props);
  },

  getStateFromProps(props) {
    const rangeType = this.getDatePropsType(props);

    return {
      rangeType: rangeType,
      absoluteStart: rangeType === 'absolute' ? moment(props.startDate) : '',
      absoluteEnd: rangeType === 'absolute' ? moment(props.endDate) : '',
      relativeStart: rangeType === 'relative' ? props.startDate : '',
      relativeEnd: rangeType === 'relative' ? props.endDate : ''
    };
  },

  componentWillReceiveProps(nextProps) {
    this.setState(this.getStateFromProps(nextProps));
  },

  getDatePropsType(props) {
    const { startDate, endDate } = props;
    const startValid = moment(startDate).isValid();
    const endValid = moment(endDate).isValid();
    return startValid && endValid ? 'absolute' : 'relative';
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onCancel}>
        <Modal.Header closeButton>
          <Modal.Title>Change Date Range</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Tabs
            className="tabs-inside-modal"
            activeKey={this.state.rangeType}
            onSelect={this.onSelectEndpoint}
            animation={false}
            id="daterangemodaltab"
          >
            <Tab eventKey="relative" title="Relative date range">
              {this.renderRelative()}
            </Tab>
            <Tab eventKey="absolute" title="Absolute date range">
              {this.renderAbsolute()}
            </Tab>
          </Tabs>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="link" onClick={this.props.onCancel}>
            Close
          </Button>
          <Button bsStyle="primary" disabled={!this.isValid()} onClick={this.setAndClose}>
            Change
          </Button>
        </Modal.Footer>
      </Modal>
    );
  },

  renderAbsolute() {
    return (
      <Form horizontal>
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            Since
          </Col>
          <Col sm={9}>
            <DateTime
              closeOnSelect
              dateFormat={DATE_FORMAT}
              timeFormat={false}
              value={this.state.absoluteStart}
              onChange={val => this.setState({ absoluteStart: val })}
              isValidDate={current => !moment(this.state.absoluteEnd, 'YYYY-MM-DD', true).isValid() || (current.isBefore(this.state.absoluteEnd))}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            Until
          </Col>
          <Col sm={9}>
            <DateTime
              closeOnSelect
              dateFormat={DATE_FORMAT}
              timeFormat={false}
              value={this.state.absoluteEnd}
              onChange={val => this.setState({ absoluteEnd: val })}
              isValidDate={current => !moment(this.state.absoluteStart, 'YYYY-MM-DD', true).isValid() || (current.isAfter(this.state.absoluteStart))}
            />
          </Col>
        </FormGroup>
      </Form>
    );
  },

  selectSuggestion(e) {
    const range = SUGGESTIONS[e.target.value];
    this.setState({
      relativeStart: range.start,
      relativeEnd: range.end
    });
  },

  renderRelative() {
    return (
      <Form horizontal>
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            Suggestions
          </Col>
          <Col sm={9}>
            <FormControl componentClass="select" defaultValue="" onChange={this.selectSuggestion}>
              {[]
                .concat('')
                .concat(Object.keys(SUGGESTIONS))
                .map(op => (
                  <option disabled={op === ''} key={op} value={op}>
                    {op === '' ? 'Choose...' : op}
                  </option>
                ))}
            </FormControl>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            Since
          </Col>
          <Col sm={9}>
            <FormControl
              type="text"
              onChange={e => this.setState({ relativeStart: e.target.value })}
              value={this.state.relativeStart}
            />
          </Col>
        </FormGroup>
        <FormGroup>
          <Col sm={3} componentClass={ControlLabel}>
            Until
          </Col>
          <Col sm={9}>
            <FormControl
              type="text"
              onChange={e => this.setState({ relativeEnd: e.target.value })}
              value={this.state.relativeEnd}
            />
          </Col>
        </FormGroup>
      </Form>
    );
  },

  onSelectEndpoint(selectedTab) {
    this.setState({ rangeType: selectedTab });
  },

  setAndClose() {
    const { rangeType, absoluteStart, absoluteEnd, relativeStart, relativeEnd } = this.state;
    const start = rangeType === 'relative' ? relativeStart : absoluteStart.format(DATE_FORMAT);
    const end = rangeType === 'relative' ? relativeEnd : absoluteEnd.format(DATE_FORMAT);
    this.props.onSet(start, end);
    this.props.onCancel();
  },

  isValid() {
    if (this.state.rangeType === 'absolute') {
      const { absoluteStart, absoluteEnd } = this.state;
      const startValid = absoluteStart && moment(absoluteStart).isValid();
      const endValid = absoluteEnd && moment(absoluteEnd).isValid();
      return startValid && endValid;
    }
    const { relativeStart, relativeEnd } = this.state;
    return relativeStart !== '' && relativeEnd !== '';
  }
});
