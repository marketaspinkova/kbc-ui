import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import date from '../../../utils/date';
import PureRendererMixin from 'react-immutable-render-mixin';
import {Link} from 'react-router';
import {NewLineToBr} from '@keboola/indigo-ui';
import {Tree} from '@keboola/indigo-ui';
import {Alert} from 'react-bootstrap';
import FileLink  from './FileLink';

const classMap = {
  error: 'danger',
  warn: 'warning',
  success: 'success',
  info: 'info'
};

export default createReactClass({
  mixins: [PureRendererMixin],
  propTypes: {
    event: PropTypes.object.isRequired,
    link: PropTypes.object,
    backButton: PropTypes.object
  },

  render() {
    const {event} = this.props;
    return (
      <div className="event-detail-container">
        {this._backLink()}
        <h2>
          Event {event.get('id')}
        </h2>
        <Alert bsStyle={this._eventStyle()}>
          <NewLineToBr text={event.get('message')} />
          {event.get('description') ? <p className="well">{event.get('description')}</p> : null }
        </Alert>
        <div className="row">
          <div className="col-md-3">
            Created
          </div>
          <div className="col-md-9">
            {date.format(event.get('created'))}
          </div>
        </div>
        <div className="row">
          <div className="col-md-3">
            Component
          </div>
          <div className="col-md-9">
            {event.get('component')}
          </div>
        </div>
        <div className="row">
          <div className="col-md-3">
            Configuration ID
          </div>
          <div className="col-md-9">
            {event.get('configurationId') || 'N/A'}
          </div>
        </div>
        <div className="row">
          <div className="col-md-3">
            Run ID
          </div>
          <div className="col-md-9">
            {event.get('runId')}
          </div>
        </div>
        <div className="row">
          <div className="col-md-3">
            Creator
          </div>
          <div className="col-md-9">
            {event.getIn(['token', 'name'])}
          </div>
        </div>
        {this._attachments()}
        {this._treeSection('Parameters', 'params')}
        {this._treeSection('Results', 'results')}
        {this._treeSection('Performance', 'performance')}
        {this._treeSection('Context', 'context')}
      </div>
    );
  },

  _backLink() {
    if (this.props.backButton) {
      return this.props.backButton;
    }
    return (
      <Link {...this.props.link}>
        <span className="fa fa-chevron-left"/> Back
      </Link>
    );
  },

  _attachments() {
    if (!this.props.event.get('attachments').size) {
      return null;
    }
    return (
      <div>
        <h3>Attachments</h3>
        <ul>
          {this.props.event.get('attachments').map((attachment, idx) => {
            return (
              <li key={idx}>
                <FileLink file={attachment} />
              </li>
            );
          }).toArray()}
        </ul>
      </div>
    );
  },

  _treeSection(header, eventPropertyName) {
    if (!this.props.event.get(eventPropertyName, []).size) {
      return null;
    }
    return (
      <div>
        <h3>{header}</h3>
        <Tree data={this.props.event.get(eventPropertyName)} />
      </div>
    );
  },

  _eventStyle() {
    return classMap[this.props.event.get('type')];
  }
});
