import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, ButtonToolbar, Button } from 'react-bootstrap';
import Tooltip from '../../../../react/common/Tooltip';
import { Controlled as CodeMirror } from 'react-codemirror2'

export default createReactClass({
  propTypes: {
    parameters: PropTypes.object.isRequired,
    onSet: PropTypes.func,
    isEditable: PropTypes.bool
  },

  getInitialState() {
    return {
      parameters: this.props.parameters,
      parametersString: JSON.stringify(this.props.parameters, null, '\t'),
      isValid: true,
      showModal: false
    };
  },

  close() {
    return this.setState({
      showModal: false
    });
  },

  open() {
    return this.setState({
      showModal: true
    });
  },

  getDefaultProps() {
    return { isEditable: true };
  },

  renderJsonArea() {
    return (
      <CodeMirror
        editorDidMount={(editor) => editor.refresh()}
        value={this.state.parametersString}
        onBeforeChange={this._handleChange}
        options={{
          theme: 'solarized',
          mode: 'application/json',
          cursorHeight: !this.props.isEditable ? 0 : 1,
          height: 'auto',
          readOnly: !this.props.isEditable,
          autoFocus: this.props.isEditable,
          lineNumbers: true,
          lineWrapping: true,
          lint: true,
          tabSize: 2,
          gutters: ['CodeMirror-lint-markers']
        }}
      />
    );
  },

  render() {
    return (
      <span>
        {this.renderOpenButton()}
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton={true}>
            <Modal.Title>Task parameters</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ padding: 0 }}>{this.renderJsonArea()}</Modal.Body>
          <Modal.Footer>
            {this.props.isEditable && (
              <ButtonToolbar>
                <Button bsStyle="link" onClick={this.close}>
                  Cancel
                </Button>
                <Button bsStyle="primary" disabled={!this.state.isValid} onClick={this._handleSet}>
                  Set
                </Button>
              </ButtonToolbar>
            )}
          </Modal.Footer>
        </Modal>
      </span>
    );
  },

  renderOpenButton() {
    return (
      <Button onClick={this.open} bsStyle="link">
        <Tooltip placement="top" tooltip="Task parameters">
          <i className="fa fa-fw fa-ellipsis-h fa-lg" />
        </Tooltip>
      </Button>
    );
  },

  _handleChange(editor, data, value) {
    this.setState({
      parametersString: value
    });
    try {
      return this.setState({
        parameters: JSON.parse(value),
        isValid: true
      });
    } catch (error) {
      return this.setState({
        isValid: false
      });
    }
  },

  _handleSet() {
    this.close();
    return this.props.onSet(this.state.parameters);
  }
});
