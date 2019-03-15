import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ComponentsStore from '../../components/stores/ComponentsStore';
import { Link } from 'react-router';
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

export default createReactClass({
  mixins: [PureRenderMixin],

  propTypes: {
    event: PropTypes.object.isRequired,
    link: PropTypes.object.isRequired
  },

  render() {
    const status = classmap[this.props.event.get('type')];
    const component = this.getComponent();

    return (
      <Link
        className='tr'
        to={this.props.link.to}
        params={this.props.link.params}
        query={{ 
          ...this.props.link.query,
          eventId: this.props.event.get('id') 
        }}
      >
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
