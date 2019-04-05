import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Col, ControlLabel, FormGroup, Radio, HelpBlock } from 'react-bootstrap';

export default createReactClass({
  propTypes: {
    onChangeAction: PropTypes.func.isRequired,
    valueAction: PropTypes.string.isRequired
  },

  render() {
    return (
      <div className="form-horizontal">
        {this.renderActionRadio()}
      </div>
    );
  },

  renderActionRadio() {
    return (
      <FormGroup>
        <Col componentClass={ControlLabel} md={2}>
          On each run:
        </Col>
        <Col md={10}>
          <FormGroup>
            <Radio
              value="update"
              checked={this.props.valueAction === 'update'}
              onChange={(event) => this.props.onChangeAction(event.target.value)}
            >
              Update file
            </Radio>
            <HelpBlock>
              Always rewrite the same file
            </HelpBlock>
          </FormGroup>
          <FormGroup>
            <Radio
              value="create"
              checked={this.props.valueAction === 'create'}
              onChange={(event) => this.props.onChangeAction(event.target.value)}
            >
              Create new file
            </Radio>
            <HelpBlock>
              Every time create a unique file
            </HelpBlock>
          </FormGroup>
        </Col>
      </FormGroup>
    );
  }
});
