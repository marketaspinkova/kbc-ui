import React, { PropTypes } from 'react';
import { Modal } from 'react-bootstrap';
import { RadioGroup } from 'react-radio-group';
import ConfirmButtons from '../../../../../../react/common/ConfirmButtons';
import RadioGroupInput from '../../../../../../react/common/RadioGroupInput';

export default React.createClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    availableVersions: PropTypes.array.isRequired,
    imageTag: PropTypes.string
  },

  getInitialState() {
    return {
      imageTag: this.props.imageTag,
      isSaving: false
    };
  },

  render() {
    return (
      <Modal onHide={this.onClose} show={this.props.show}>
        <Modal.Header>
          <Modal.Title>Transformation Backend Version</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Most of the time there's no need to change version of the transformation backend.
          </p>
          <p>
            Change version only if you have problems with <code>Latest</code> version. And please let us know.
          </p>
          <RadioGroup
            name="imageTag"
            selectedValue={this.state.imageTag}
            onChange={(value) => {
              this.setState({
                imageTag: value
              });
            }}
          >
            {this.props.availableVersions.map((version, index) => {
              return (
                <RadioGroupInput
                  key={`${version.version}-${index}`}
                  label={version.label}
                  value={version.version}
                />
              );
            })}
          </RadioGroup>
        </Modal.Body>
        <Modal.Footer>
          <ConfirmButtons
            saveButtonType="submit"
            onCancel={this.onClose}
            onSave={this.onSave}
            isSaving={this.state.isSaving}
            isDisabled={this.props.imageTag === this.state.imageTag}
          />
        </Modal.Footer>
      </Modal>
    );
  },

  onClose() {
    this.props.onClose();
  },

  onSave() {
    this.setState({
      isSaving: true
    });
    this.props.onSave(this.state.imageTag)
      .then(() => {
        this.props.onClose();
      })
      .finally(() => {
        this.setState({
          isSaving: false
        });
      });
  }
});
