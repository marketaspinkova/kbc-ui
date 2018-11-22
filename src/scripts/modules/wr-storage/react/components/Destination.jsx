import React, { PropTypes } from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import { Form, FormControl, FormGroup, ControlLabel, HelpBlock, Col, Checkbox } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      destination: PropTypes.string.isRequired,
      incremental: PropTypes.bool.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    actions: PropTypes.object,
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
        <h3>Destination</h3>
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
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Table Name
          </Col>
          <Col sm={8}>
            <FormControl
              type="text"
              value={this.props.value.destination}
              onChange={function(e) {
                props.onChange({destination: e.target.value.trim()});
              }}
              placeholder="mytable"
              disabled={this.props.disabled}
            />
            <HelpBlock>
              Name of the table stored in the target project's bucket.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col smOffset={4} sm={8}>
            <Checkbox
              checked={this.props.value.incremental}
              onChange={function(e) {
                props.onChange({incremental: e.target.checked});
              }}
            >Incremental</Checkbox>
            <HelpBlock>
              The table will be imported incrementally into the target project. Primary keys will be kept.
            </HelpBlock>
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
