import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import {Modal} from 'react-bootstrap';
import ConfirmButtons from '../../../react/common/ConfirmButtons';
import Select from 'react-select';

export default createReactClass({
  propTypes: {
    template: PropTypes.string.isRequired,
    templates: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired
  },

  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Template</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please select template</p>
          <div className="form-horizontal">
            <Select
              name="jobTemplates"
              value={this.props.template}
              options={this.props.templates}
              onChange={this.props.onChange}
              placeholder="Select template"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            isSaving={false}
            saveLabel="Preset from template"
            saveStyle="warning"
            isDisabled={!this.isValid()}
            onSave={this.handleSave}
            onCancel={this.props.onHide}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  isValid() {
    return this.props.template.length > 0;
  },

  handleSave() {
    this.props.onSubmit();
    this.props.onHide();
  }

});
