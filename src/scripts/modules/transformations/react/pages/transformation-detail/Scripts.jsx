import React, { PropTypes } from 'react';
import Edit from './ScriptsEdit';
import Clipboard from '../../../../../react/common/Clipboard';
import SaveButton from '../../components/SaveButton';

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
        <h2 style={{ lineHeight: '32px' }}>
          Scripts
          <small>
            <Clipboard text={this.props.scripts} />
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
        <SaveButton
          isSaving={this.props.isSaving}
          isChanged={this.props.isChanged}
          onSave={this.props.onEditSubmit}
          onReset={this.props.onEditCancel}
          disabled={!this.props.isEditingValid}
          onDescriptionChange={this.props.onDescriptionChange}
          changeDescription={this.props.changeDescription}
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
