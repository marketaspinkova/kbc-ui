import React, { PropTypes } from 'react';
import Input from './ProcessorsInput';
import Clipboard from '../../../../react/common/Clipboard';
import SaveButtons from '../../../../react/common/SaveButtons';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    value: PropTypes.string.isRequired,
    isEditingValid: PropTypes.bool.isRequired,
    isSaving: PropTypes.bool.isRequired,
    onEditCancel: PropTypes.func.isRequired,
    onEditChange: PropTypes.func.isRequired,
    onEditSubmit: PropTypes.func.isRequired,
    isChanged: PropTypes.bool.isRequired
  },

  getValue() {
    if (this.props.isChanged === false && (this.props.value === '' || this.props.value === '{}')) {
      return JSON.stringify({before: [], after: []}, null, 2);
    }
    return this.props.value;
  },

  render() {
    return (
      <div>
        <h2 style={{lineHeight: '32px', marginBottom: '10px'}}>
          Processors
          {' '}
          <small>
            <Clipboard text={this.props.value}/>
          </small>
        </h2>
        {this.renderButtons()}
        <Input
          value={this.getValue()}
          disabled={this.props.isSaving}
          onChange={this.props.onEditChange}
        />
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
        />
      </span>
    );
  }
});
