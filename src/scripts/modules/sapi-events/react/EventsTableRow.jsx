import React, { PropTypes } from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ComponentsStore from '../../components/stores/ComponentsStore';
import { Link } from 'react-router';
import _ from 'underscore';
import classnames from 'classnames';
import { format } from '../../../utils/date';
import { NewLineToBr } from '@keboola/indigo-ui';
import ComponentName from '../../../react/common/ComponentName';
import ComponentIcon from '../../../react/common/ComponentIcon';

const classmap = {
  error: 'bg-danger',
  warn: 'bg-warning',
  success: 'bg-success'
};

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    event: PropTypes.object.isRequired,
    link: PropTypes.object.isRequired
  },

  render() {
    const status = classmap[this.props.event.get('type')];
    const component = this.getComponent();

    return (
      <Link {...this.linkProps()}>
        <div className={classnames('td', 'text-nowrap', status)}>{format(this.props.event.get('created'))}</div>
        <div className={classnames('td', 'text-nowrap', status)}>
          {component.get('name') && (
            <span>
              <ComponentIcon component={component} size="32" resizeToSize="16" />
              <ComponentName component={component} showType={true} capitalize={true} />
            </span>
          )}
        </div>
        <div className={classnames('td', status)}>
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
  },

  getComponent() {
    const componentId = this.props.event.get('component');
    const component = componentId === 'storage'
      ? ComponentsStore.getComponent('keboola.storage')
      : ComponentsStore.getComponent(componentId);

    if (!component) {
      return ComponentsStore.unknownComponent(componentId);
    }

    return component;
  }
});
