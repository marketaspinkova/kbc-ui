import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import classnames from 'classnames';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    totalCount: PropTypes.number.isRequired,
    activeCount: PropTypes.number.isRequired
  },

  render() {
    const { activeCount, totalCount } = this.props;

    return (
      <span
        className={classnames('label', {
          'label-default': activeCount === 0,
          'label-primary': activeCount > 0
        })}
      >
        {`${activeCount} / ${totalCount}`}
      </span>
    );
  }
});
