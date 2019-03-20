import PropTypes from 'prop-types';
import React from 'react';

import createReactClass from 'create-react-class';

import immutableMixin from 'react-immutable-render-mixin';
import {FormControl, FormGroup, ControlLabel, HelpBlock, Form, Col} from 'react-bootstrap';
import SyncActionSimpleValue from '../../../configurations/react/components/SyncActionSimpleValue';
import ExternalProjectLink from '../../../components/react/components/ExternalProjectLink';
import ExternalBucketLink from '../../../components/react/components/ExternalBucketLink';

export default createReactClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      url: PropTypes.string.isRequired,
      token: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired
  },


  render() {
    const infoAction = this.props.actions.get('info');

    return (
      <Form horizontal>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Project Region
          </Col>
          <Col sm={8}>
            <FormControl
              componentClass="select"
              value={this.props.value.url}
              onChange={event => this.props.onChange({url: event.target.value})}
              disabled={this.props.disabled}
            >
              <option value="" disabled>Select region</option>
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
              onChange={event => this.props.onChange({token: event.target.value})}
              disabled={this.props.disabled}
            />
            <HelpBlock>Use a token with permissions limited only to write to a single target bucket.</HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Project
          </Col>
          <Col sm={8}>
            <FormControl.Static>
              <ExternalProjectLink
                stackUrl={infoAction.getIn(['request', 'configData', 'parameters', 'url'])}
                projectId={infoAction.getIn(['data', 'projectId'])}
              >
                <SyncActionSimpleValue
                  action={infoAction}
                  valueKey="projectName"
                />
              </ExternalProjectLink>
            </FormControl.Static>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Bucket
          </Col>
          <Col sm={8}>
            <FormControl.Static>
              <ExternalBucketLink
                stackUrl={infoAction.getIn(['request', 'configData', 'parameters', 'url'])}
                projectId={infoAction.getIn(['data', 'projectId'])}
                bucketId={infoAction.getIn(['data', 'bucket'])}
              >
                <SyncActionSimpleValue
                  action={infoAction}
                  valueKey="bucket"
                />
              </ExternalBucketLink>
            </FormControl.Static>
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
