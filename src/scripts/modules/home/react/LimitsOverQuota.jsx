import PropTypes from 'prop-types';
import React from 'react';
import {Link} from 'react-router';
import {AlertBlock} from '@keboola/indigo-ui';
import {bytesToGBFormatted, numericMetricFormatted} from '../../../utils/numbers';

export default React.createClass({
  propTypes: {
    limits: PropTypes.object.isRequired
  },

  render() {
    const {limits} = this.props;

    if (!limits.size) {
      return null;
    }

    return (
      <AlertBlock type="danger" title="Project is over quota">
        <ul className="list-unstyled list-no-padding">
          {limits.map(this.limit)}
        </ul>
      </AlertBlock>
    );
  },

  limit(limit, index) {
    let values;

    if (limit.get('unit') === 'bytes') {
      values = `(${bytesToGBFormatted(limit.get('metricValue'))} GB of ${bytesToGBFormatted(limit.get('limitValue'))} GB)`;
    } else {
      values = `(${numericMetricFormatted(limit.get('metricValue'))} of ${numericMetricFormatted(limit.get('limitValue'))})`;
    }

    return (
      <li key={index}>
        <Link to="settings-limits">
          <strong>{limit.get('section')} - {limit.get('name')}</strong> {values}
        </Link>
      </li>
    );
  }

});
