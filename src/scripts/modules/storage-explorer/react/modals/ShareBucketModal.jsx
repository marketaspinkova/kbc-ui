import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, Form, Col, FormGroup, Radio, HelpBlock } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import { bucketSharingTypes } from '../../Constants';

const INITIAL_STATE = {
  sharing: bucketSharingTypes.ORGANIZATION
};

export default createReactClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    bucket: PropTypes.object.isRequired,
    isSharing: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return INITIAL_STATE;
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.onHide}>
        <Form onSubmit={this.handleSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Share Bucket</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Bucket will be shared to the organization. Please choose who will be able to link the bucket to projects.
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
              isSaving={this.props.isSharing}
              isDisabled={this.isDisabled()}
              saveLabel="Enable"
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
    this.props.onConfirm(this.state.sharing).then(this.onHide);
  },

  onHide() {
    this.setState(INITIAL_STATE);
    this.props.onHide();
  },

  isDisabled() {
    return this.props.isSharing || !!!this.state.sharing;
  }
});
