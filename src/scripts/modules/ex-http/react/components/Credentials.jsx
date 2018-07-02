import React, { PropTypes } from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import { Input } from './../../../../react/common/KbcBootstrap';

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    value: PropTypes.shape({
      baseUrl: PropTypes.string.isRequired,
      maxRedirects: PropTypes.string
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    const props = this.props;
    return (
      <div className="form-horizontal">
        <Input
          type="text"
          label="Base URL"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.baseUrl}
          onChange={function(e) {
            props.onChange({baseUrl: e.target.value});
          }}
          placeholder="https://example.com"
          disabled={this.props.disabled}
          help={(
            <span>
              Base URL is common for all files downloaded from a certain site/domain.
            </span>
          )}
        />
        <Input
          type="text"
          label="Maximum Redirects"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.maxRedirects}
          onChange={function(e) {
            props.onChange({maxRedirects: e.target.value});
          }}
          disabled={this.props.disabled}
          help={(
            <span>
              The maximum number of redirects to follow when downloading files.
              Leave empty to use default value (5).
            </span>
          )}
        />
      </div>
    );
  }
});
