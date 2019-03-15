import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Tooltip from '../../../../react/common/Tooltip';
import {ExternalLink} from '@keboola/indigo-ui';

const API_URL = 'https://developers.facebook.com/tools/explorer';

export default createReactClass({
  propTypes: {
    ids: PropTypes.object.isRequired,
    query: PropTypes.object.isRequired,
    apiVersion: PropTypes.string.isRequired
  },

  render() {
    if (this.isQueryValid()) {
      return this.renderLink();
    } else {
      return this.renderDisabledLink();
    }
  },

  renderDisabledLink() {
    return (
      <Tooltip placement="top" tooltip={this.tooltip}>
        <span className="btn btn-link"  disabled>
          {this.linkText}
        </span>
      </Tooltip>
    );
  },

  linkText: 'Try Query',

  tooltip: 'Opens configured query in Facebook Graph API Explorer tool',

  generateQueryParams() {
    const version = `version=${this.props.apiVersion}`;
    const path = this.query('path');
    const queryIds = this.query('ids');
    const ids = queryIds ? queryIds : this.props.ids.take(50).join(',');
    const paramsStr = this.props.query
      .delete('path')
      .reduce((memo, value, key) => {
        const pair = key === 'ids' ? `ids=${ids}` : `${key}=${value}`;
        const result = memo.first ? `${memo.result}?${pair}` : `${memo.result}&${pair}`;
        return {first: false, result: result};
      }, {first: true, result: path});
    return `path=${encodeURIComponent(paramsStr.result)}&${version}`;
  },

  renderLink() {
    const params = this.generateQueryParams();
    const url = `${API_URL}?method=GET&${params}`;
    return (
      <Tooltip placement="top" tooltip={this.tooltip}>
        <ExternalLink href={url} className="btn btn-link">
          {this.linkText}
        </ExternalLink>
      </Tooltip>
    );
  },

  isQueryValid() {
    const isFields = !!this.query('fields');
    const isEndpoint = !!this.query('path');
    return isFields || isEndpoint;
  },

  query(path, defaultValue) {
    return this.props.query.getIn([].concat(path), defaultValue);
  }

});
