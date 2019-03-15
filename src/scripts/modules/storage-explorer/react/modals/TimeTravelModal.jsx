import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import moment from 'moment';
import { Modal, Col, Alert, Form, FormGroup, FormControl, ControlLabel } from 'react-bootstrap';
import Select from 'react-select';
import DateTime from 'react-datetime';
import ConfirmButtons from '../../../../react/common/ConfirmButtons';

export default createReactClass({
  propTypes: {
    show: PropTypes.bool.isRequired,
    table: PropTypes.object.isRequired,
    buckets: PropTypes.object.isRequired,
    sapiToken: PropTypes.object.isRequired,
    onConfirm: PropTypes.func.isRequired,
    onHide: PropTypes.func.isRequired
  },

  getInitialState() {
    return this.defaultInitialState();
  },

  defaultInitialState() {
    return {
      timestamp: moment(this.minRestoreDate()).add(1, 'minute'),
      tableName: this.props.table.get('name') + '_' + moment().format('YYYYMMDDHHmmss'),
      destinationBucket: this.props.table.getIn(['bucket', 'id'])
    };
  },

  render() {
    const retentionLimit = this.props.sapiToken.getIn(['owner', 'dataRetentionTimeInDays']);
    const bucketsOptions = this.props.buckets
      .map(bucket => {
        return { label: bucket.get('id'), value: bucket.get('id') };
      })
      .toArray();

    return (
      <Modal show={this.props.show} onHide={this.onHide}>
        <Form onSubmit={this.handleSubmit} horizontal>
          <Modal.Header closeButton>
            <Modal.Title>Restore table using time travel</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Alert>
              This will create a new table which will be a replica of the data as it existed at the time you choose.
              Note that this method can not replicate data from further in the past than your project limit of{' '}
              <strong>{retentionLimit} days</strong>.
            </Alert>

            <FormGroup>
              <Col sm={4} componentClass={ControlLabel}>
                Replication Date
              </Col>
              <Col sm={8}>
                <DateTime
                  closeOnSelect
                  value={this.state.timestamp}
                  dateFormat="YYYY-MM-DD"
                  timeFormat="HH:mm:ss"
                  onChange={this.handleTimestamp}
                  isValidDate={this.isValidDate}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={4} componentClass={ControlLabel}>
                Destination Bucket
              </Col>
              <Col sm={8}>
                <Select
                  clearable={false}
                  backspaceRemoves={false}
                  deleteRemoves={false}
                  value={this.state.destinationBucket}
                  onChange={this.handleDestinationBucket}
                  options={bucketsOptions}
                />
              </Col>
            </FormGroup>
            <FormGroup>
              <Col sm={4} componentClass={ControlLabel}>
                Table Name
              </Col>
              <Col sm={8}>
                <FormControl type="text" value={this.state.tableName} onChange={this.handleTableName} />
              </Col>
            </FormGroup>
          </Modal.Body>
          <Modal.Footer>
            <ConfirmButtons
              isSaving={false}
              isDisabled={this.isDisabled()}
              saveLabel="Create"
              onCancel={this.onHide}
              onSave={this.handleSubmit}
              saveButtonType="submit"
            />
          </Modal.Footer>
        </Form>
      </Modal>
    );
  },

  handleTimestamp(timestamp) {
    let tableName = this.state.tableName;

    if (this.state.tableName.match(/_\d{14}$/)) {
      tableName = this.props.table.get('name') + '_' + moment(timestamp).format('YYYYMMDDHHmmss');
    }

    this.setState({
      timestamp,
      tableName
    });
  },

  handleDestinationBucket(selected) {
    this.setState({
      destinationBucket: selected.value
    });
  },

  handleTableName(event) {
    this.setState({
      tableName: event.target.value
    });
  },

  handleSubmit(event) {
    event.preventDefault();
    this.props.onConfirm(this.state.destinationBucket, this.state.tableName, this.state.timestamp);
    this.onHide();
  },

  onHide() {
    this.setState(this.defaultInitialState());
    this.props.onHide();
  },

  isValidDate(current) {
    const min = this.minRestoreDate();
    const max = moment();

    return current.isAfter(min) && current.isBefore(max);
  },

  minRestoreDate() {
    const dataRetentionTimeInDays = this.props.sapiToken.getIn(['owner', 'dataRetentionTimeInDays']);
    const projectRetentionMinDate = moment().subtract(dataRetentionTimeInDays, 'days');
    const tableCreatedDate = moment(this.props.table.get('created'));

    return moment.max(projectRetentionMinDate, tableCreatedDate);
  },

  isDisabled() {
    return !this.state.timestamp || !this.state.destinationBucket || !this.state.tableName;
  }
});
