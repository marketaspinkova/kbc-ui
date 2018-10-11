import React from 'react';

export default React.createClass({
  propTypes: {
    backend: React.PropTypes.string.isRequired,
    type: React.PropTypes.string
  },

  render() {
    if (this.props.backend === 'mysql' && this.props.type === 'simple') {
      return <span className="label label-default">mysql</span>;
    }

    if (this.props.backend === 'mysql') {
      return <span className="label label-default">{`mysql ${this.props.type}`}</span>;
    }

    if (this.props.backend === 'redshift' && this.props.type === 'simple') {
      return <span className="label label-success">redshift</span>;
    }

    if (this.props.backend === 'remote') {
      return <span className="label label-danger">remote</span>;
    }

    if (this.props.backend === 'docker' && this.props.type === 'r') {
      return <span className="label label-danger">R</span>;
    }

    if (this.props.backend === 'docker' && this.props.type === 'python') {
      return <span className="label label-danger">Python</span>;
    }

    if (this.props.backend === 'docker' && this.props.type === 'openrefine') {
      return <span className="label label-danger">OpenRefine (beta)</span>;
    }

    if (this.props.backend === 'snowflake') {
      return <span className="label label-info">snowflake</span>;
    }

    return null;
  }
});
