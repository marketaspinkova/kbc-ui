import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import ImmutableRenderMixin from 'react-immutable-render-mixin';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import DatatypeLabel from './DatatypeLabel';

export default createReactClass({
  mixins: [ImmutableRenderMixin],

  propTypes: {
    datatypes: PropTypes.object.isRequired,
    handleRemoveDataType: PropTypes.func.isRequired
  },

  render() {
    return (
      <span>
        <div>
          {!this.props.datatypes.count() ? (
            <p>No data types set yet.</p>
          ) : (
            <ListGroup>
              {this.props.datatypes
                .sort()
                .map((datatype, key) => (
                  <ListGroupItem key={key}>
                    <DatatypeLabel column={key.toString()} datatype={datatype}/>
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
        </div>
      </span>
    );
  }
});
