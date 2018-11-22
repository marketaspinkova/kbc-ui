import React, { PropTypes } from 'react';
import immutableMixin from 'react-immutable-render-mixin';
// import { Input } from './../../../../react/common/KbcBootstrap';
import {FormControl, FormGroup, ControlLabel, HelpBlock, Form, Col} from 'react-bootstrap';
import {Loader} from '@keboola/indigo-ui';

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      url: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    invokeAction: PropTypes.func.isRequired,
    pendingActions: PropTypes.object.isRequired
  },

  componentDidMount() {
    this.props.invokeAction('info');
  },


  renderInfoActionLoader() {
    if (this.props.pendingActions.has('info')) {
      return (<Loader />);
    }
  },

  render() {
    const props = this.props;
    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Project Region
          </Col>
          <Col sm={8}>
            <FormControl
              componentClass="select"
              placeholder="select"
              value={this.props.value.url}
              onChange={function(e) {
                props.onChange({url: e.target.value});
              }}
              disabled={this.props.disabled}
            >
              <option value="" disabled>Select region</option>
              <option value="https://connection.ap-southeast-2.keboola.com/">AU (connection.ap-southeast-2.keboola.com)</option>
              <option value="https://connection.eu-central-1.keboola.com/">EU (connection.eu-central-1.keboola.com)</option>
              <option value="https://connection.keboola.com/">US (connection.keboola.com)</option>
            </FormControl>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Storage API Token
          </Col>
          <Col sm={8}>
            <FormControl
              type="password"
              value={this.props.value.token}
              onChange={function(e) {
                props.onChange({token: e.target.value});
              }}
              disabled={this.props.disabled}
            />
            <HelpBlock>Use token with permissions limited only to write to a single target bucket.</HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Project
          </Col>
          <Col sm={8}>
            <FormControl.Static>
              {this.renderInfoActionLoader()}
              {this.props.actions.getIn(['info', 'data', 'projectName'])}
            </FormControl.Static>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Bucket
          </Col>
          <Col sm={8}>
            <FormControl.Static>
              {this.renderInfoActionLoader()}
              {this.props.actions.getIn(['info', 'data', 'bucket'])}
            </FormControl.Static>
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
