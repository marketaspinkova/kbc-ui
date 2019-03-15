import PropTypes from 'prop-types';
import React from 'react';
import { startsWith } from 'underscore.string';
import { Alert, ButtonGroup, Button, FormControl, Label, Well } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';

import GraphCanvas from '../../../../../react/common/GraphCanvas';
import graphUtils from '../../../../../utils/graphUtils';
import TableGraphApi from '../../../TableGraphApi';

export default React.createClass({
  propTypes: {
    table: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      data: null,
      direction: this.getDefaultDirection(),
      loading: false
    };
  },

  componentDidMount() {
    this.loadData();
    window.addEventListener('resize', this.handleResize);
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.direction !== prevState.direction) {
      this.loadData();
    }

    this.initGraph();
  },

  componentWillUnmount() {
    this.cancellablePromise && this.cancellablePromise.cancel();
    window.removeEventListener('resize', this.handleResize);
  },

  render() {
    return (
      <div>
        {this.renderControls()}
        {this.renderGraph()}
      </div>
    );
  },

  renderGraph() {
    if (this.state.loading) {
      return (
        <p>
          <Loader /> loading...
        </p>
      );
    }

    if (!this.state.data || !this.state.data.transitions.length) {
      return <p>There are no connections for table {this.props.table.get('id')}.</p>;
    }

    return (
      <div>
        <div ref="graph" />
        {this.renderLegend()}
        {this.renderNote()}
      </div>
    );
  },

  renderLegend() {
    return (
      <Well>
        <Label bsStyle="success">Input</Label>
        <Label style={{ backgroundColor: '#333' }}>Transformation</Label>
        <Label style={{ backgroundColor: '#777' }}>Remote Transformation</Label>
        <Label bsStyle="info">Output</Label>
        <Label bsStyle="warning">Writer</Label>
      </Well>
    );
  },

  renderControls() {
    return (
      <div>
        <ButtonGroup>
          <Button onClick={this.handleZoomIn}>
            <span className="fa fa-search-plus" /> Zoom in
          </Button>
          <Button onClick={this.handleZoomOut}>
            <span className="fa fa-search-minus" /> Zoom out
          </Button>
          <Button onClick={this.handleReset}>
            <span className="fa fa-times" /> Reset
          </Button>
        </ButtonGroup>

        <div className="pull-right">
          <FormControl componentClass="select" value={this.state.direction} onChange={this.handleChangeDirection}>
            <option value="forward">Forward</option>
            <option value="backward">Backward</option>
          </FormControl>
        </div>

        <hr />
      </div>
    );
  },

  renderNote() {
    return (
      <Alert bsStyle="info">
        <p>
          Please note that the graph shows a maximum of 7 levels of nesting and the only supported writer is GoodData
          writer.
        </p>
      </Alert>
    );
  },

  loadData() {
    this.setState({ loading: true });
    this.cancellablePromise = TableGraphApi.load(this.props.table.get('id'), this.state.direction)
      .then(data => {
        data.nodes = graphUtils.addLinksToNodes(data.nodes);
        this.setState({ data, loading: false });
      });
  },

  handleChangeDirection(event) {
    this.setState({ direction: event.target.value });
  },

  checkDefaultTableDirection() {
    const direction = this.getDefaultDirection();

    if (this.state.direction !== direction) {
      this.setState({ direction });
    }
  },

  getDefaultDirection() {
    return startsWith(this.props.table.get('id'), 'in.') ? 'forward' : 'backward';
  },

  initGraph() {
    if (this.refs.graph) {
      this.graph = new GraphCanvas({}, this.refs.graph);
    }

    if (this.graph) {
      this.graph.data = this.state.data;
      this.graph.spacing = 1;
      this.graph.styles = graphUtils.styles();
      this.graph.render();
    }
  },

  handleZoomIn() {
    if (this.graph) {
      this.graph.zoomIn();
    }
  },

  handleZoomOut() {
    if (this.graph) {
      this.graph.zoomOut();
    }
  },

  handleReset() {
    if (this.graph) {
      this.graph.reset();
    }
  },

  handleResize() {
    if (this.graph) {
      this.graph.adjustCanvasWidth();
    }
  }
});
