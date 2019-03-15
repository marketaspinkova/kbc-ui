import PropTypes from 'prop-types';
import React from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import { Form, FormControl, FormGroup, ControlLabel, HelpBlock, Col } from 'react-bootstrap';
import { RadioGroup } from 'react-radio-group';
import RadioGroupInput from '../../../../react/common/RadioGroupInput';
import SyncActionSimpleValue from '../../../configurations/react/components/SyncActionSimpleValue';
import ExternalProjectLink from '../../../components/react/components/ExternalProjectLink';
import ExternalBucketLink from '../../../components/react/components/ExternalBucketLink';

export default React.createClass({
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
            <RadioGroup
              selectedValue={this.props.value.mode}
              onChange={value => this.props.onChange({ mode: value })}
            >
              <RadioGroupInput
                wrapperClassName="col-xs-12"
                label="Update"
                help="Use incremental loading on the target table."
                value="update"
              />
              <RadioGroupInput
                wrapperClassName="col-xs-12"
                label="Replace"
                help="Replace data in the target table. If the structures of the source and destination tables do not match, an error will be reported."
                value="replace"
              />
              <RadioGroupInput
                wrapperClassName="col-xs-12"
                label="Recreate"
                help="Drop and create the target table. This will make sure that the structure of the destination table matches that of the source table."
                value="recreate"
              />
            </RadioGroup>
          </Col>
        </FormGroup>
      </Form>
    );
  }
});
