import React from 'react';
import TableRow from './EventsTableRow';
import { Loader } from '@keboola/indigo-ui';
import PureRendererMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  mixins: [PureRendererMixin],

  propTypes: {
    events: React.PropTypes.object.isRequired,
    link: React.PropTypes.object.isRequired,
    isLoading: React.PropTypes.bool.isRequired,
    onEventSelect: React.PropTypes.func
  },

  render() {
    return (
      <div className="table table-striped table-hover">
        <div className="thead">
          <div className="tr">
            <div className="th">Created</div>
            <div className="th">Component</div>
            <div className="th">Event {this.props.isLoading && <Loader />}</div>
          </div>
        </div>
        <div className="tbody">{this._body()}</div>
      </div>
    );
  },

  _body() {
    return this.props.events
      .map(event => {
        return (
          <TableRow
            key={event.get('id')}
            onClick={this._handleEventSelect.bind(this, event)}
            event={event}
            link={this.props.link}
          />
        );
      })
      .toArray();
  },

  _handleEventSelect(selectedEvent) {
    return this.props.onEventSelect(selectedEvent);
  }
});
