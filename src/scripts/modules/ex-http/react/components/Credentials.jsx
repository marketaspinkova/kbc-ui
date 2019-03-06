import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { trim } from 'underscore.string';
import { Input } from './../../../../react/common/KbcBootstrap';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    value: PropTypes.shape({
      baseUrl: PropTypes.string.isRequired,
      maxRedirects: PropTypes.string
    }),
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  },

  render() {
    return (
      <div className="form-horizontal">
        <Input
          type="text"
          label="Base URL"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.baseUrl}
          onChange={e => {
            this.props.onChange({ baseUrl: trim(e.target.value) });
          }}
          placeholder="https://example.com"
          disabled={this.props.disabled}
          help={<span>Base URL is common for all files downloaded from a certain site/domain.</span>}
        />
        <Input
          type="number"
          min="0"
          label="Maximum Redirects"
          labelClassName="col-xs-4"
          wrapperClassName="col-xs-8"
          value={this.props.value.maxRedirects}
          onChange={e => {
            this.props.onChange({ maxRedirects: e.target.value });
          }}
          disabled={this.props.disabled}
          help={
            <span>
              The maximum number of redirects to follow when downloading files. Leave empty to use default value (5).
            </span>
          }
        />
      </div>
    );
  }
});
