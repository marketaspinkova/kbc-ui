import PropTypes from 'prop-types';
import React from 'react';
import {ExternalLink} from '@keboola/indigo-ui';

export default React.createClass({

  propTypes: {
    documentationUrl: PropTypes.string.isRequired
  },

  render() {
    return (
      <p className="small">
        {'For more information on how to configure the MongoDB extractor, follow the '}
        <ExternalLink href={this.props.documentationUrl}>guide</ExternalLink>.
      </p>
    );
  }
});
