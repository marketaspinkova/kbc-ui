import React from 'react';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import DatatypeLabel from './DatatypeLabel';

export default React.createClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    datatypes: React.PropTypes.object.isRequired,
    handleRemoveDataType: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <span>
        <div className="row">
          <span className="col-xs-12">
            {!this.props.datatypes.count() ? (
              <p>No data types set yet.</p>
            ) : (
              <ListGroup>
                {this.props.datatypes
                  .sort()
                  .map((datatype, key) => (
                    <ListGroupItem key={key}>
                      <DatatypeLabel column={key.toString()} datatype={datatype} />
                      <i
                        className="kbc-icon-cup kbc-cursor-pointer pull-right"
                        onClick={() => {
                          return this.props.handleRemoveDataType(key);
                        }}
                      />
                    </ListGroupItem>
                  ))
                  .toArray()}
              </ListGroup>
            )}
          </span>
        </div>
      </span>
    );
  }
});
