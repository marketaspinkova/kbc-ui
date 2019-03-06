import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import { ListGroup, ListGroupItem } from 'react-bootstrap';
import DatatypeLabel from './DatatypeLabel';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    datatypes: React.PropTypes.object.isRequired,
    handleRemoveDataType: React.PropTypes.func.isRequired
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
