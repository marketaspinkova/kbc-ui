import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'react-bootstrap';
import { Loader, ExternalLink } from '@keboola/indigo-ui';
import Textarea from 'react-textarea-autosize';

export default React.createClass({
  propTypes: {
    text: PropTypes.string,
    isSaving: PropTypes.bool,
    placeholder: PropTypes.string,
    onCancel: PropTypes.func,
    onSave: PropTypes.func,
    onChange: PropTypes.func
  },

  _onChange(e) {
    this.props.onChange(e.target.value);
  },

  render() {
    return (
      <div className="form-inline kbc-inline-edit kbc-inline-textarea">
        <Textarea
          autoFocus={true}
          value={this.props.text}
          disabled={this.props.isSaving}
          placeholder={this.props.placeholder}
          onChange={this._onChange}
          className="form-control"
          minRows={2}
        />
        <span className="kbc-inline-edit-buttons">
          {this.props.isSaving && (
            <span>
              <Loader />{' '}
            </span>
          )}
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
            disabled={this.props.isSaving}
            onClick={this.props.onSave}
          >
            Save
          </Button>
        </span>
        <span className="small help-block">
          <ExternalLink href="https://blog.ghost.org/markdown/">Markdown</ExternalLink>
          {' is supported'}
        </span>
      </div>
    );
  }
});
