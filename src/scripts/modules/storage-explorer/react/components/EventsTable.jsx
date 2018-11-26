import React, { PropTypes } from 'react';
import PureRendererMixin from 'react-immutable-render-mixin';
import ComponentsStore from '../../../components/stores/ComponentsStore';
import { Table } from 'react-bootstrap';
import { NewLineToBr } from '@keboola/indigo-ui';
import { format } from '../../../../utils/date';
import ComponentName from '../../../../react/common/ComponentName';
import ComponentIcon from '../../../../react/common/ComponentIcon';
import EventDetailModal from '../modals/EventDetailModal';

export default React.createClass({
  mixins: [PureRendererMixin],

  propTypes: {
    events: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      eventDetail: null
    };
  },

  render() {
    if (!this.props.events.count()) {
      return null;
    }

    return (
      <div>
        {this.renderEventDetailModal()}

        <Table responsive stripped hover>
          <thead>
            <tr>
              <th>Created</th>
              <th>Component</th>
              <th>Event</th>
              <th>Creator</th>
            </tr>
          </thead>
          <tbody>{this.props.events.map(this.renderRow).toArray()}</tbody>
        </Table>
      </div>
    );
  },

  renderRow(event) {
    const component = this.getComponent(event.get('component'));

    return (
      <tr key={event.get('id')} onClick={() => this.eventDetail(event)} className="kbc-cursor-pointer">
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

  renderEventDetailModal() {
    if (!this.state.eventDetail) {
      return null;
    }

    return <EventDetailModal event={this.state.eventDetail} onHide={this.resetEvent} />;
  },

  eventDetail(event) {
    this.setState({
      eventDetail: event
    });
  },

  resetEvent() {
    this.setState({
      eventDetail: null
    });
  },

  getComponent(componentId) {
    const component = ComponentsStore.getComponent(componentId);

    if (!component) {
      return ComponentsStore.unknownComponent(componentId);
    }

    return component;
  }
});
