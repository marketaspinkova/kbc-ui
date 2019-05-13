import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { Check } from '@keboola/indigo-ui';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import { List } from 'immutable';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    value: PropTypes.object.isRequired
  },

  render() {
    return (
      <ListGroup className="clearfix">
        <ListGroupItem className="row">
          <strong className="col-md-4">Source</strong>
          <span className="col-md-8">
            out/files/
            {this.props.value.get('source')}
          </span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Tags</strong>
          <span className="col-md-8">{this.renderTags()}</span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Is public</strong>
          <span className="col-md-8">
            <Check isChecked={this.props.value.get('is_public')} />
          </span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Is permanent</strong>
          <span className="col-md-8">
            <Check isChecked={this.props.value.get('is_permanent')} />
          </span>
        </ListGroupItem>
      </ListGroup>
    );
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

  renderTag(tag) {
    return (
      <span className="label kbc-label-rounded-small label-default" key={tag}>
        {tag}
      </span>
    );
  }
});
