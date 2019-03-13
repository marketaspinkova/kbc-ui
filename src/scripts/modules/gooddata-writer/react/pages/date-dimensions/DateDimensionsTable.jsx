import PropTypes from 'prop-types';
import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import Row from './DateDimensionsRow';

export default React.createClass({
  propTypes: {
    dimensions: PropTypes.object.isRequired,
    configurationId: PropTypes.string.isRequired,
    pid: PropTypes.string.isRequired
  },
  mixins: [PureRenderMixin],

  render() {
    return (
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Include Time</th>
            <th>Identifier</th>
            <th>Template</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {this.props.dimensions.map(this.renderRow).toArray()}
        </tbody>
      </table>
    );
  },

  renderRow(dimension) {
    return (
      <Row
        key={dimension.get('id')}
        dimension={dimension}
        configurationId={this.props.configurationId}
        pid={this.props.pid}
      />
    );
  }
});
