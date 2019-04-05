import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import immutableMixin from 'react-immutable-render-mixin';
import { Form, FormControl, FormGroup, ControlLabel, HelpBlock, Radio, Col } from 'react-bootstrap';
import SyncActionSimpleValue from '../../../configurations/react/components/SyncActionSimpleValue';
import ExternalProjectLink from '../../../components/react/components/ExternalProjectLink';
import ExternalBucketLink from '../../../components/react/components/ExternalBucketLink';

export default createReactClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      destination: PropTypes.string.isRequired,
      mode: PropTypes.string.isRequired
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
    actions: PropTypes.object
  },

  render() {
    const infoAction = this.props.actions.get('info');

    return (
      <Form horizontal>
        <h3>Destination</h3>
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
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Table Name
          </Col>
          <Col sm={8}>
            <FormControl
              type="text"
              value={this.props.value.destination}
              onChange={event => this.props.onChange({destination: event.target.value.trim()})}
              placeholder="mytable"
              disabled={this.props.disabled}
            />
            <HelpBlock>
              Name of the table stored in the target project&apos;s bucket.
            </HelpBlock>
          </Col>
        </FormGroup>
        <FormGroup>
          <Col componentClass={ControlLabel} sm={4}>
            Mode
          </Col>
          <Col sm={8}>
            <FormGroup>
              <Radio
                value="update"
                checked={this.props.value.mode === 'update'}
                onChange={(event) => this.props.onChange({ mode: event.target.value })}
              >
                Update
              </Radio>
              <HelpBlock>
                Always rewrite the same file
              </HelpBlock>
            </FormGroup>
            <FormGroup>
              <Radio
                value="replace"
                checked={this.props.value.mode === 'replace'}
                onChange={(event) => this.props.onChange({ mode: event.target.value })}
              >
                Replace
              </Radio>
              <HelpBlock>
                Replace data in the target table. If the structures of the source and destination tables do not match, an error will be reported.
              </HelpBlock>
            </FormGroup>
            <FormGroup>
              <Radio
                value="recreate"
                checked={this.props.value.mode === 'recreate'}
                onChange={(event) => this.props.onChange({ mode: event.target.value })}
              >
                Recreate
              </Radio>
              <HelpBlock>
                Drop and create the target table. This will make sure that the structure of the destination table matches that of the source table.
              </HelpBlock>
            </FormGroup>
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
