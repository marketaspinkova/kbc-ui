import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, Form, Col, FormGroup, Radio, HelpBlock } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';
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
              Please choose who will be able to link the bucket to projects.
              <ExternalLink href="https://help.keboola.com/storage/buckets/sharing/">Learn more</ExternalLink>.
            </p>

            <FormGroup>
              <Col sm={11} smOffset={1}>
                <FormGroup>
                  <Radio
                    value={bucketSharingTypes.ORGANIZATION}
                    checked={this.state.sharing === bucketSharingTypes.ORGANIZATION}
                    onChange={this.handleSharing}
                  >
                    Organization Members
                  </Radio>
                  <HelpBlock>
                    Only organization members are able to link the shared bucket to a project.
                  </HelpBlock>
                </FormGroup>
                <FormGroup>
                  <Radio
                    value={bucketSharingTypes.ORGANIZATION_PROJECT}
                    checked={this.state.sharing === bucketSharingTypes.ORGANIZATION_PROJECT}
                    onChange={this.handleSharing}
                  >
                    Project Members
                  </Radio>
                  <HelpBlock>
                    Every project member is able to link the shared bucket to a project.
                  </HelpBlock>
                </FormGroup>
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

  handleSharing(event) {
    this.setState({
      sharing: event.target.value
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
