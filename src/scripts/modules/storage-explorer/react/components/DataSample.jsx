import React, { PropTypes } from 'react';
import { Map, fromJS } from 'immutable';
import { Alert, Form, FormGroup, FormControl, Col, ButtonGroup, Button, Table } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import Select from 'react-select';
import { dataPreview } from '../../Actions';

export default React.createClass({
  propTypes: {
    table: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      data: Map(),
      error: null,
      loading: false,
      filtered: false,
      filterColumn: '',
      filterValue: ''
    };
  },

  componentDidMount() {
    this.fetchDataPreview();
  },

  render() {
    return (
      <div>
        {(this.state.data.count() > 1 || this.state.filtered) && this.renderSearchForm()}
        {this.renderTable()}
      </div>
    );
  },

  renderSearchForm() {
    return (
      <Form onSubmit={this.handleSearch} horizontal>
        <FormGroup>
          <Col sm={4}>
            <Select
              clearable={false}
              disabled={false}
              placeholder="Filter by column"
              value={this.state.filterColumn}
              onChange={this.handleSearchColumn}
              options={this.tableColumns()}
            />
          </Col>
          <Col sm={4}>
            <FormControl
              type="text"
              placeholder="Value"
              value={this.state.filterValue}
              onChange={this.handleSearchValue}
            />
          </Col>
          <Col sm={4}>
            <ButtonGroup>
              <Button className="btn btn-link" onClick={this.resetSearchForm} disabled={!this.state.filtered}>
                Reset
              </Button>
              <Button bsStyle="success" type="submit" disabled={!this.state.filterColumn || !this.state.filterValue}>
                Search
              </Button>
            </ButtonGroup>
          </Col>
        </FormGroup>
      </Form>
    );
  },

  renderTable() {
    if (this.state.loading) {
      return (
        <p>
          <Loader /> Loading data..
        </p>
      );
    }

    if (this.state.data.count() < 2) {
      return <p>{this.state.filtered ? 'No data found.' : 'Table is empty.'}</p>;
    }

    if (this.state.error) {
      return <Alert bsStyle="danger">{this.state.error}</Alert>;
    }

    return (
      <Table responsive striped hover>
        <thead>
          <tr>
            {this.state.data.first().map((header, index) => (
              <th key={index}>
                <strong>{header}</strong>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {this.state.data.shift().map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((column, columnIndex) => (
                <td key={`${rowIndex}-${columnIndex}`}>{column}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    );
  },

  handleSearchColumn(column) {
    this.setState({
      filterColumn: column.value
    });
  },

  handleSearchValue(event) {
    this.setState({
      filterValue: event.target.value
    });
  },

  handleSearch(event) {
    event.preventDefault();

    const params = {
      whereColumn: this.state.filterColumn,
      'whereValues[]': [this.state.filterValue]
    };

    this.fetchDataPreview(params).then(() => {
      this.setState({ filtered: true });
    });
  },

  resetSearchForm() {
    if (this.state.filtered) {
      this.fetchDataPreview();
    }

    this.setState({
      filtered: false,
      filterColumn: '',
      filterValue: ''
    });
  },

  tableColumns() {
    return this.props.table
      .get('columns')
      .map(column => ({
        label: column,
        value: column
      }))
      .toArray();
  },

  fetchDataPreview(params = {}) {
    this.setState({ loading: true });

    return dataPreview(this.props.table.get('id'), params)
      .then(csv => {
        this.setState({ data: fromJS(csv) });
      })
      .catch(errorMessage => {
        this.setState({ dataPreview: Map(), error: errorMessage });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }
});
