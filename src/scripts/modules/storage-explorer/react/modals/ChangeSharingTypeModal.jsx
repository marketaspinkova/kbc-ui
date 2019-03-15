import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, Form, Col, FormGroup } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';
import { RadioGroup } from 'react-radio-group';
import RadioGroupInput from '../../../../react/common/RadioGroupInput';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import { bucketSharingTypes } from '../../Constants';

export default createReactClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    bucket: PropTypes.object.isRequired,
    isChangingSharingType: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      sharing: this.props.bucket.get('sharing')
    };
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.onHide}>
        <Form onSubmit={this.handleSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Change Bucket Sharing Type</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Please choose who will be able to link bucket to projects.
              <ExternalLink href="https://help.keboola.com/storage/buckets/sharing/">Learn more</ExternalLink>.
            </p>

            <FormGroup>
              <Col sm={11} smOffset={1}>
                <RadioGroup selectedValue={this.state.sharing} onChange={this.handleSharing}>
                  <RadioGroupInput
                    label="Organization Members"
                    help="Only organization members are able to link the shared bucket to a project."
                    value={bucketSharingTypes.ORGANIZATION}
                  />
                  <RadioGroupInput
                    label="Project Members"
                    help="Every project member is able to link the shared bucket to a project."
                    value={bucketSharingTypes.ORGANIZATION_PROJECT}
                  />
                </RadioGroup>
              </Col>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={this.props.isChangingSharingType}
              isDisabled={this.isDisabled()}
              saveLabel="Change"
              onCancel={this.onHide}
              onSave={this.handleSubmit}
              saveButtonType="submit"
            />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  handleSharing(type) {
    this.setState({
      sharing: type
    });
  },

  handleSubmit(event) {
    event.preventDefault();
    this.props.onConfirm(this.state.sharing).then(this.props.onHide);
  },

  onHide() {
    this.setState({
      sharing: this.props.bucket.get('sharing')
    }, () => {
      this.props.onHide();
    });
  },

  isDisabled() {
    return this.props.isChangingSharingType || !!!this.state.sharing;
  }
});
