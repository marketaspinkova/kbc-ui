import React, { PropTypes } from 'react';
import {ExternalLink} from '@keboola/indigo-ui';

export default React.createClass({

  propTypes: {
    documentationUrl: PropTypes.string.isRequired
  },

  render() {
    return (
      <p className="small">
        {'For more information about configuring MongoDB Extractor follow guide at '}
        <ExternalLink href={this.props.documentationUrl}>https://help.keboola.com</ExternalLink>.
      </p>
    );
  }
});
