import PropTypes from 'prop-types';
import React from 'react';
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
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>Update Mode {this.renderLoader('loadOnly')}</Col>
          <Col sm={9}>
            <Radio
              disabled={this.props.disabled}
              checked={!this.props.value.loadOnly}
              onChange={() => this.onSave('loadOnly')}
              name="updatetype" > Update model and load data
            </Radio>
            <Radio
              disabled={this.props.disabled}
              checked={this.props.value.loadOnly}
              onChange={() => this.onSave('loadOnly')}
              name="updatetype" > Load data only
            </Radio>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={3}>Load Mode {this.renderLoader('multiLoad')} </Col>
          <Col sm={9}>
            <Radio
              disabled={this.props.disabled}
              checked={this.props.value.multiLoad}
              onChange={() => this.onSave('multiLoad')}
              name="multiload" > Multiload - all tables at once
            </Radio>
            <Radio
              disabled={this.props.disabled}
              checked={!this.props.value.multiLoad}
              onChange={() => this.onSave('multiLoad')}
              name="multiload" > Separate - one table at a time
            </Radio>
          </Col>
        </FormGroup>
      </Form>
    );
  },

  renderLoader(property) {
    const {saving} = this.state;
    return saving === property && <Loader />;
  },

  onSave(property) {
    this.setState({saving: property});
    const newValue = {[property]: !this.props.value[property]};
    this.props.onSave(newValue).then(() => this.setState({saving: null}));
  }
});
