import React, { PropTypes } from 'react';
import PureRendererMixin from 'react-immutable-render-mixin';
import ComponentsStore from '../../../components/stores/ComponentsStore';
import { Table } from 'react-bootstrap';
import { NewLineToBr } from '@keboola/indigo-ui';
import { format } from '../../../../utils/date';
import ComponentName from '../../../../react/common/ComponentName';
import ComponentIcon from '../../../../react/common/ComponentIcon';

export default React.createClass({
  mixins: [PureRendererMixin],

  propTypes: {
    events: PropTypes.object.isRequired
  },

  render() {
    if (!this.props.events.count()) {
      return null;
    }

    return (
      <Table responsive stripped hover>
        <thead>
          <tr>
            <th>Created</th>
            <th>Component</th>
            <th>Event</th>
            <th>Creator</th>
          </tr>
        </thead>
        <tbody>{this.props.events.map(this.renderRow)}</tbody>
      </Table>
    );
  },

  renderRow(event) {
    const component = this.getComponent(event.get('component'));

    return (
      <tr>
        <td>{format(event.get('created'))}</td>
        <td>
          <span>
            <ComponentIcon component={component} size="32" resizeToSize="16" />
            <ComponentName component={component} showType={true} capitalize={true} />
          </span>
        </td>
        <td>
          <NewLineToBr text={event.get('message')} />
        </td>
        <td>{event.getIn(['token', 'name'])}</td>
      </tr>
    );
  },

  getComponent(componentId) {
    const component = ComponentsStore.getComponent(componentId);

    if (!component) {
      return ComponentsStore.unknownComponent(componentId);
    }

    return component;
  }
});
