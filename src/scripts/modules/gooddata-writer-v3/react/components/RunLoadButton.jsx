import PropTypes from 'prop-types';
import React from 'react';
import RunComponentButton from '../../../components/react/components/RunComponentButton';
import {Checkbox} from 'react-bootstrap';

export default React.createClass({

  propTypes: {
    getRunParams: PropTypes.func.isRequired,
    isTableDisabled: PropTypes.bool,
    loadOnly: PropTypes.bool,
    buttonMode: PropTypes.string,
    tableId: PropTypes.string
  },

  getInitialState() {
    return {
      loadOnly: this.props.loadOnly
    };
  },

  componentWillReceiveProps(nextProps) {
    this.setState({loadOnly: nextProps.loadOnly});
  },

  render() {
    return (
      <RunComponentButton
        key="run"
        title="Run"
        mode={this.props.buttonMode}
        component="keboola.gooddata-writer"
        runParams={() => this.props.getRunParams(this.props.tableId, this.state.loadOnly)}
      >
        {this.getMessage()}
        {this.renderLoadOnlyForm()}
      </RunComponentButton>

    );
  },


  renderLoadOnlyForm() {
    return (
      <Checkbox
        checked={this.state.loadOnly}
        onChange={() => this.setState({loadOnly: !this.state.loadOnly})}>
        skip model update and load only table data
      </Checkbox>
    );
  },

  getMessage() {
    let message = `You are about to run a load of ${this.props.tableId} table.`;
    if (this.props.isTableDisabled) {
      message += ' Load to GooDataProject is disabled and will be forced to run.';
    }
    return message;
  }

});
