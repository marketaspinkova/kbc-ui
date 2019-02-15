import React from 'react';
import { Modal } from 'react-bootstrap';
import { ExternalLink } from '@keboola/indigo-ui';
import Textarea from 'react-textarea-autosize';
import { HelpBlock } from 'react-bootstrap';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';


export default React.createClass({
  propTypes: {
    onHide: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    show: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      value: ''
    };
  },

  onChangeValue(e) {
    this.setState({
      value: e.target.value
    });
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
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
              />
              <HelpBlock>
                HELP
                {' '}
                <ExternalLink href="https://help.keboola.com/manipulation/transformations/sandbox/#connecting-to-sandbox">
                  the documentation
                </ExternalLink>
              </HelpBlock>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isDisabled="true"
            saveLabel="Submit"
            onCancel={this.props.onHide}
            onSave={this.onSubmit}
          />
        </Modal.Footer>
      </Modal>
    );
  }
});