import React, { PropTypes } from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import ComponentsStore from '../../../components/stores/ComponentsStore';
import { Table } from 'react-bootstrap';
import { truncate } from 'underscore.string';
import { format } from '../../../../utils/date';
import ComponentName from '../../../../react/common/ComponentName';
import ComponentIcon from '../../../../react/common/ComponentIcon';
import EventDetailModal from '../modals/EventDetailModal';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    events: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      showDetailModal: false,
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

        <Table responsive striped hover>
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
      <tr key={event.get('id')} onClick={() => this.openEventDetail(event)} className="kbc-cursor-pointer">
        <td>{format(event.get('created'))}</td>
        <td>
          <span>
            <ComponentIcon component={component} size="32" resizeToSize="16" />
            <ComponentName component={component} showType={true} capitalize={true} />
          </span>
        </td>
        <td>{truncate(event.get('message'), 60)}</td>
        <td>{event.getIn(['token', 'name'])}</td>
      </tr>
    );
  },

  renderEventDetailModal() {
    if (!this.state.eventDetail) {
      return null;
    }

    return (
      <EventDetailModal
        show={this.state.showDetailModal}
        event={this.state.eventDetail}
        onHide={this.closeDetailModal}
      />
    );
  },

  openEventDetail(event) {
    this.setState({ showDetailModal: true, eventDetail: event });
  },

  closeDetailModal() {
    this.setState({ showDetailModal: false });
  },

  getComponent(componentId) {
    const component = ComponentsStore.getComponent(componentId);

    if (!component) {
      return ComponentsStore.unknownComponent(componentId);
    }

    return component;
  }
});
