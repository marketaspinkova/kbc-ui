import React, { PropTypes } from 'react';
import { Alert, Form, FormGroup, FormControl, Col, ButtonGroup, Button, Table, Row } from 'react-bootstrap';
import { Loader } from '@keboola/indigo-ui';
import Select from 'react-select';
import StorageTableDataPreviewItem from '../../../../react/common/StorageTableDataPreviewItem';
import { dataPreview } from '../../Actions';

export default React.createClass({
  propTypes: {
    table: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      data: [],
      error: null,
      loading: false,
      filtered: false,
      filterColumn: null,
      filterValue: ''
    };
  },

  componentDidMount() {
    this.fetchDataPreview();
  },

  componentWillUnmount() {
    this.cancellablePromise && this.cancellablePromise.cancel();
  },

  render() {
    return (
      <div>
        {(this.state.filtered || this.haveDataRows()) && this.renderSearchForm()}
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
              <Button bsStyle="link" onClick={this.resetSearchForm} disabled={!this.state.filtered}>
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

    if (!this.haveDataRows()) {
      return <p>{this.state.filtered ? 'No data found.' : 'Table is empty.'}</p>;
    }

    if (this.state.error) {
      return <Alert bsStyle="danger">{this.state.error}</Alert>;
    }

    return (
      <Row>
        <Table responsive striped hover>
          <thead>
            <tr>
              {this.state.data.columns.map((header, index) => (
                <th key={index}>
                  <strong>{header}</strong>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {this.state.data.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((column, columnIndex) => (
                  <td key={`${rowIndex}-${columnIndex}`}>
                    <StorageTableDataPreviewItem item={column} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </Row>
    );
  },

  handleSearchColumn(column) {
    this.setState({
      filterColumn: column ? column.value : null
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
      filterColumn: null,
      filterValue: ''
    });
  },

  haveDataRows() {
    return this.state.data.rows && this.state.data.rows.length > 0;
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

    this.cancellablePromise = dataPreview(this.props.table.get('id'), params)
      .then(json => {
        this.setState({ data: json, loading: false });
      })
      .catch((error) => {
        let errorMessage = null;
        if (error.response && error.response.body) {
          if (error.response.body.code === 'storage.maxNumberOfColumnsExceed') {
            errorMessage = 'Data sample cannot be displayed. Too many columns.';
          } else {
            errorMessage = error.response.body.message;
          }
        }

        this.setState({
          data: [],
          loading: false,
          error: errorMessage
        });

        if (!errorMessage) {
          throw error;
        }
      });

    return this.cancellablePromise;
  }
});
