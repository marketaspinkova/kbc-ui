import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    isLast: React.PropTypes.bool
  },

  render() {
    if (this.props.isLast) {
      return <span className="fa fa-check-circle fa-fw kbc-version-icon last" />;
    }

    return <span className="fa fa-circle-o fa-fw kbc-version-icon" />;
  }
});
