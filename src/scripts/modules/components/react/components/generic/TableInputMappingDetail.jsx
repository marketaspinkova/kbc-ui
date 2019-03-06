import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { List } from 'immutable';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import TableLinkEx from '../StorageApiTableLinkEx';
import FiltersDescription from './FiltersDescription';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    value: React.PropTypes.object.isRequired
  },

  render() {
    return (
      <ListGroup className="clearfix">
        <ListGroupItem className="row">
          <strong className="col-md-4">Source table</strong>
          <span className="col-md-6">
            <TableLinkEx tableId={this.props.value.get('source')} />
          </span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Columns</strong>
          <span className="col-md-6">
            {this.props.value.get('columns', List()).count()
              ? this.props.value.get('columns').join(', ')
              : 'Use all columns'}
          </span>
        </ListGroupItem>
        <ListGroupItem className="row">
          <strong className="col-md-4">Filters</strong>
          <FiltersDescription value={this.props.value} />
        </ListGroupItem>
      </ListGroup>
    );
  }
});
