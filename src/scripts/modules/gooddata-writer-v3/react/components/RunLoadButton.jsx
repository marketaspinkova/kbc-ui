import React, {PropTypes} from 'react';
import RunComponentButton from '../../../components/react/components/RunComponentButton';
import {Checkbox} from 'react-bootstrap';

export default React.createClass({

  propTypes: {
    getRunParams: PropTypes.func.isRequired,
    isTableDisabled: PropTypes.bool,
    buttonMode: PropTypes.string,
    tableId: PropTypes.string
  },

  getDefaultProps: () => ({
    message: 'You are about to run load of all tables'
  }),

  getInitialState: () => ({
    loadOnly: false
  }),

  render() {
    return (
      <RunComponentButton
        key="run"
        title="Run"
        mode={this.props.buttonMode}
        component="keboola.gooddata-writer"
        runParams={() => this.props.getRunParams(this.state.loadOnly)}
      >
        {this.getMessage()}
        {this.props.tableId && this.renderLoadOnlyForm()}
      </RunComponentButton>

    );
  },


  renderLoadOnlyForm() {
    return (
      <Checkbox
        checked={this.state.loadOnly}
        onChange={() => this.setState({loadOnly: !this.state.loadOnly})}>
        Skip model update and load only table data
      </Checkbox>
    );
  },

  getMessage() {
    let message = 'You are about to run load of all tables';
    if (this.props.tableId) {
      message = `You are about to run load of ${this.props.tableId} table.`;
    }
    if (this.props.isTableDisabled) {
      message += ' Load to GooDataProject is disabled and will be forced to run.';
    }
    return message;
  }

});
