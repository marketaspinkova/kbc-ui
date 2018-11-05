import React, {PropTypes} from 'react';
import { FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import Edit from './ScriptsEdit';
import Clipboard from '../../../../../react/common/Clipboard';
import SaveButtons from '../../../../../react/common/SaveButtons';

/* global require */
require('codemirror/mode/r/r');
require('codemirror/mode/python/python');

export default React.createClass({
  propTypes: {
    bucketId: PropTypes.string.isRequired,
    transformation: PropTypes.object.isRequired,
    scripts: PropTypes.string.isRequired,
    isEditingValid: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onEditCancel: PropTypes.func.isRequired,
    onEditChange: PropTypes.func.isRequired,
    onDescriptionChange: PropTypes.func.isRequired,
    changeDescription: PropTypes.string.isRequired,
    onEditSubmit: PropTypes.func.isRequired,
    isChanged: PropTypes.bool.isRequired
  },

  render() {
    return (
      <div>
        <h2 style={{lineHeight: '32px'}}>
          Scripts
          <small>
            <Clipboard text={this.props.scripts}/>
          </small>
          {this.renderButtons()}
        </h2>
        {this.scripts()}
      </div>
    );
  },

  renderButtons() {
    return (
      <span className="pull-right">
        <SaveButtons
          isSaving={this.props.isSaving}
          disabled={!this.props.isEditingValid}
          isChanged={this.props.isChanged}
          onSave={this.props.onEditSubmit}
          onReset={this.props.onEditCancel}
          showModal={true}
          modalTitle="Save new scripts"
          modalBody={
            <FormGroup>
              <ControlLabel>Update description</ControlLabel>
              <FormControl
                componentClass="textarea"
                rows={3}
                autoFocus
                value={this.props.changeDescription}
                onChange={e => this.props.onDescriptionChange(e.target.value)}
                disabled={this.props.isSaving}
              />
            </FormGroup>
          }
        />
      </span>
    );
  },

  scripts() {
    return (
      <Edit
        script={this.props.scripts}
        backend={this.props.transformation.get('type')}
        disabled={this.props.isSaving}
        onChange={this.props.onEditChange}
      />
    );
  }
});
