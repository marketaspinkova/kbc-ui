import React from 'react';
import { Button } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import { Input } from './KbcBootstrap';

export default React.createClass({
  propTypes: {
    text: React.PropTypes.string,
    isSaving: React.PropTypes.bool,
    isValid: React.PropTypes.bool,
    placeholder: React.PropTypes.string,
    onCancel: React.PropTypes.func,
    onSave: React.PropTypes.func,
    onChange: React.PropTypes.func
  },

  _onChange(e) {
    this.props.onChange(e.target.value);
  },

  _onSubmit(e) {
    e.preventDefault();
    this.props.onSave();
  },

  render() {
    return (
      <div className="form-inline kbc-inline-edit">
        <form style={{ display: 'inline' }} onSubmit={this._onSubmit}>
          <Input
            ref="valueInput"
            type="text"
            bsStyle={!this.props.isValid ? 'error' : ''}
            value={this.props.text}
            disabled={this.props.isSaving}
            placeholder={this.props.placeholder}
            onChange={this._onChange}
            autoFocus={true}
          />
          <div className="kbc-inline-edit-buttons">
            <Button
              className="kbc-inline-edit-cancel"
              bsStyle="link"
              disabled={this.props.isSaving}
              onClick={this.props.onCancel}
            >
              <span className="kbc-icon-cross" />
            </Button>
            <Button
              className="kbc-inline-edit-submit"
              bsStyle="info"
              disabled={this.props.isSaving || !this.props.isValid}
              type="submit"
            >
              Save
            </Button>
            {this.props.isSaving && (
              <span>
                {' '}
                <Loader />
              </span>
            )}
          </div>
        </form>
      </div>
    );
  }
});
