import React from 'react';
import { Modal } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';
import Textarea from 'react-textarea-autosize';
import { HelpBlock } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';
import Immutable from 'immutable';


export default React.createClass({
  propTypes: {
    onHide: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      value: '',
      isValid: false
    };
  },

  onChangeValue(e) {
    this.setState({
      value: e.target.value
    });
  },

  isValidJson() {
    try {
      JSON.parse(this.state.value);
      return true;
    } catch (error) {
      return false;
    }
  },

  onSubmit() {
    this.props.onSubmit(Immutable.fromJS(JSON.parse(this.state.value)));
    this.setState({value: ''});
  },

  onHide() {
    this.props.onHide();
    this.setState({value: ''});
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.onHide}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Google Service Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form className="form">
            <div className="form-group">
              <Textarea
                label="test2"
                type="textarea"
                value={this.state.value}
                onChange={this.onChangeValue}
                className="form-control"
                minRows={10}
                placeholder="{}"
              />
              <HelpBlock>
                Insert the whole JSON of the private key here. Please read the details how to obtain the service account in the
                {' '}
                <ExternalLink href="https://help.keboola.com/manipulation/transformations/sandbox/#connecting-to-sandbox">
                  documentation
                </ExternalLink>.
              </HelpBlock>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isDisabled={!this.isValidJson()}
            saveLabel="Submit"
            onCancel={this.onHide}
            onSave={this.onSubmit}
            isSaving={false}
          />
        </Modal.Footer>
      </Modal>
    );
  }
});