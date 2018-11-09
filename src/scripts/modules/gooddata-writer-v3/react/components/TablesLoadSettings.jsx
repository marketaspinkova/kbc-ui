import React, {PropTypes} from 'react';
import {Col, ControlLabel, Radio, Form, FormGroup} from 'react-bootstrap';
import {Loader} from '@keboola/indigo-ui';

export default React.createClass({
  propTypes: {
    disabled: PropTypes.bool,
    onSave: PropTypes.func,
    value: PropTypes.shape({
      loadOnly: PropTypes.bool,
      multiLoad: PropTypes.bool
    })
  },

  getInitialState() {
    return {
      saving: null
    };
  },


  render() {
    return (
      <Form>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>Update Type</Col>
          <Col sm={10}>
            <Radio
              disabled={this.props.disabled}
              checked={!this.props.value.loadOnly}
              onChange={() => this.onSave('loadOnly')}
              name="updatetype" > Update model and load data {this.renderLoader('loadOnly', true)}
            </Radio>
            <Radio
              disabled={this.props.disabled}
              checked={this.props.value.loadOnly}
              onChange={() => this.onSave('loadOnly')}
              name="updatetype" > Load data only {this.renderLoader('loadOnly', false)}
            </Radio>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={2}>Load Type</Col>
          <Col sm={10}>
            <Radio
              disabled={this.props.disabled}
              checked={this.props.value.multiLoad}
              onChange={() => this.onSave('multiLoad')}
              name="multiload" > Multiload - all tables at once{this.renderLoader('multiLoad', false)}
            </Radio>
            <Radio
              disabled={this.props.disabled}
              checked={!this.props.value.multiLoad}
              onChange={() => this.onSave('multiLoad')}
              name="multiload" > Separate - one table at a time  {this.renderLoader('multiLoad', true)}
            </Radio>
          </Col>
        </FormGroup>
      </Form>
    );
  },

  renderLoader(property, nextValue) {
    const {saving} = this.state;
    const {value} = this.props;
    return saving === property && value[property] === nextValue && <Loader />;
  },

  onSave(property) {
    this.setState({saving: property});
    const newValue = {[property]: !this.props.value[property]};
    this.props.onSave(newValue).then(() => this.setState({saving: null}));
  }
});
