import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import PhaseModal from '../../modals/Phase';

export default React.createClass({
  mixins: [PureRenderMixin],
  propTypes: {
    transformation: PropTypes.object.isRequired,
    bucketId: PropTypes.string.isRequired,
    disabled: PropTypes.bool
  },

  getDefaultProps() {
    return {
      disabled: false
    };
  },


  render() {
    return (
      <PhaseModal
        transformation={this.props.transformation}
        bucketId={this.props.bucketId}
        disabled={this.props.disabled}
      />
    );
  }
});
