import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { Link } from 'react-router';
import _ from 'underscore';
import classnames from 'classnames';
import { format } from '../../../utils/date';
import { NewLineToBr } from '@keboola/indigo-ui';

export default React.createClass({
  mixin: [PureRenderMixin],

  propTypes: {
    event: PropTypes.object.isRequired,
    link: PropTypes.object.isRequired
  },

  render() {
    const classmap = {
      error: 'bg-danger',
      warn: 'bg-warning',
      success: 'bg-success'
    };
    const rowClass = classnames('td', classmap[this.props.event.get('type')]);

    return (
      <Link {...this.linkProps()}>
        <div className={rowClass}>{format(this.props.event.get('created'))}</div>
        <div className={rowClass}>{this.props.event.get('component')}</div>
        <div className={rowClass}>
          <NewLineToBr text={this.props.event.get('message')} />
        </div>
      </Link>
    );
  },

  linkProps() {
    const { link, event } = this.props;

    return {
      to: link.to,
      params: link.params,
      query: _.extend({}, link.query, {
        eventId: event.get('id')
      }),
      className: 'tr'
    };
  }
});
