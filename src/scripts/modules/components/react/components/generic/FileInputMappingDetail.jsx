import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { List } from 'immutable';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import {NotAvailable} from '@keboola/indigo-ui';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    value: React.PropTypes.object.isRequired
  },

  render() {
    return (
      <ListGroup className="clearfix">
        <ListGroupItem>
          <strong className="col-md-4">Tags</strong>
          <span className="col-md-6">{this.renderTags()}</span>
        </ListGroupItem>
        <ListGroupItem>
          <strong className="col-md-4">Query</strong>
          <span className="col-md-6">{this.renderQuery()}</span>
        </ListGroupItem>
        <ListGroupItem>
          <strong className="col-md-4">Processed tags</strong>
          <span className="col-md-6">{this.renderProcessedTags()}</span>
        </ListGroupItem>
      </ListGroup>
    );
  },

  renderQuery() {
    if (!this.props.value.get('query')) {
      return <NotAvailable/>;
    }

    return <code>{this.props.value.get('query')}</code>;
  },

  renderTags() {
    if (!this.props.value.get('tags', List()).count()) {
      return <NotAvailable/>;
    }

    return this.props.value
      .get('tags')
      .map(this.renderTag)
      .toArray();
  },

  renderProcessedTags() {
    if (!this.props.value.get('processed_tags', List()).count()) {
      return <NotAvailable/>;
    }

    return this.props.value
      .get('processed_tags')
      .map(this.renderTag)
      .toArray();
  },

  renderTag(tag) {
    return (
      <span className="label kbc-label-rounded-small label-default" key={tag}>
        {tag}
      </span>
    );
  }
});
