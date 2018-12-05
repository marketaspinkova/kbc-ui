import React, { PropTypes } from 'react';
import { Map, fromJS } from 'immutable';
import { Alert, Form, FormGroup, FormControl, Col, ButtonGroup, Button, Table } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import Select from 'react-select';
import StorageApi from '../../../components/StorageApi';

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
        {this.renderSearchForm()}
        {this.renderTable()}
      </div>
    );
  },

  renderSearchForm() {
    return (
      <div className="kbc-inner-padding">
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
                <Button bsStyle="success" type="submit" disabled={!this.state.filterColumn || !this.state.filterValue}>
                  Search
                </Button>
                <Button onClick={this.resetSearchForm} disabled={!this.state.filtered}>
                  Reset
                </Button>
              </ButtonGroup>
            </Col>
          </FormGroup>
        </Form>
      </div>
    );
  },

  renderTable() {
    if (this.state.loading) {
      return (
        <div className="kbc-inner-padding">
          <p>
            Loading data.. <Loader />
          </p>
        </div>
      );
    }

    if (this.state.data.count() < 2) {
      return (
        <div className="kbc-inner-padding">
          <p>{this.state.filtered ? 'No data found.' : 'Table is empty.'}</p>
        </div>
      );
    }

    if (this.state.error) {
      return (
        <div className="kbc-inner-padding">
          <Alert bsStyle="danger">{this.state.error}</Alert>
        </div>
      );
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
          {this.state.data.shift().map((row, index) => (
            <tr key={index}>
              {row.map((item, itemIndex) => (
                <td key={`${index}-${itemIndex}`}>{item}</td>
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

    return this.fetchDataPreview(params).finally(() => {
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
    return StorageApi.tableDataPreview(this.props.table.get('id'), { limit: 20, ...params })
      .then(csv => {
        this.setState({
          loading: false,
          data: fromJS(csv)
        });
      })
      .catch(error => {
        let errorMessage = null;

        if (error.response && error.response.body) {
          if (error.response.body.code === 'storage.maxNumberOfColumnsExceed') {
            errorMessage = 'Data sample cannot be displayed. Too many columns.';
          } else {
            errorMessage = error.response.body.message;
          }
        } else {
          throw new Error(JSON.stringify(error));
        }

        this.setState({
          loading: false,
          dataPreview: Map(),
          error: errorMessage
        });
      });
  }
});
