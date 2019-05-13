import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { List } from 'immutable';
import { ListGroup, ListGroupItem } from 'react-bootstrap';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    value: PropTypes.object.isRequired
  },

  render() {
    return (
      <ListGroup className="clearfix">
        <ListGroupItem className="row">
          <strong className="col-md-4">Tags</strong>
          <span className="col-md-8">{this.renderTags()}</span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Query</strong>
          <span className="col-md-8">{this.renderQuery()}</span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Processed tags</strong>
          <span className="col-md-8">{this.renderProcessedTags()}</span>
        </ListGroupItem>
      </ListGroup>
    );
  },

  renderQuery() {
    if (!this.props.value.get('query')) {
      return 'N/A';
    }

    return <code>{this.props.value.get('query')}</code>;
  },

  renderTags() {
    if (!this.props.value.get('tags', List()).count()) {
      return 'N/A';
    }

    return this.props.value
      .get('tags')
      .map(this.renderTag)
      .toArray();
  },

  renderProcessedTags() {
    if (!this.props.value.get('processed_tags', List()).count()) {
      return 'N/A';
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
