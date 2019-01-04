import React, { PropTypes } from 'react';
import { Modal, Form, Col, FormGroup } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';
import { RadioGroup } from 'react-radio-group';
import RadioGroupInput from '../../../../react/common/RadioGroupInput';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default React.createClass({
  propTypes: {
    bucket: PropTypes.object.isRequired,
    isSharing: PropTypes.bool.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      sharing: ''
    };
  },

  render() {
    return (
      <Modal onHide={this.onHide} show={true}>
        <Form onSubmit={this.handleSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Share Bucket</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Bucket will be shared to organization. Please choose who will be able to link bucket to projects.
              <ExternalLink href="https://help.keboola.com/storage/buckets/sharing/">Learn more</ExternalLink>.
            </p>

            <FormGroup>
              <Col sm={11} smOffset={1}>
                <RadioGroup selectedValue={this.state.sharing} onChange={this.handleSharing}>
                  <RadioGroupInput
                    label="Organization Members"
                    help="Only organization members are able to link the shared bucket to a project."
                    value="organization"
                  />
                  <RadioGroupInput
                    label="Project Members"
                    help="Every project member is able to link the shared bucket to a project."
                    value="organization-project"
                  />
                </RadioGroup>
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

  handleSharing(type) {
    this.setState({
      sharing: type
    });
  },

  handleSubmit(event) {
    event.preventDefault();
    this.props.onConfirm(this.state.sharing).then(this.onHide);
  },

  onHide() {
    this.setState({
      sharing: ''
    });
    this.props.onHide();
  },

  isDisabled() {
    return this.props.isSharing || !!!this.state.sharing;
  }
});
