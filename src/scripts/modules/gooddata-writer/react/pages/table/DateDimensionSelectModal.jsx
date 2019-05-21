import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Modal, ButtonToolbar, Button, Tabs, Tab } from 'react-bootstrap';
import { Check } from '@keboola/indigo-ui';
import NewDimensionForm from './../../components/NewDimensionForm';

import actionCreators from '../../../actionCreators';
import dateDimensionStore from '../../../dateDimensionsStore';
import createStoreMixin from '../../../../../react/mixins/createStoreMixin';

export default createReactClass({
  mixins: [createStoreMixin(dateDimensionStore)],
  propTypes: {
    configurationId: PropTypes.string.isRequired,
    column: PropTypes.object.isRequired,
    onSelect: PropTypes.func.isRequired
  },

  componentDidMount() {
    return actionCreators.loadDateDimensions(this.props.configurationId);
  },

  getStateFromStores() {
    return {
      isLoading: dateDimensionStore.isLoading(this.props.configurationId),
      dimensions: dateDimensionStore.getAll(this.props.configurationId),
      isCreatingNewDimension: dateDimensionStore.isCreatingNewDimension(this.props.configurationId),
      newDimension: dateDimensionStore.getNewDimension(this.props.configurationId)
    };
  },

  _handleNewDimensionSave() {
    return actionCreators.saveNewDateDimension(this.props.configurationId).then((dateDimension) => {
      this.props.onSelect({
        selectedDimension: dateDimension.get('name')
      });
      return this.close();
    });
  },

  _handleNewDimensionUpdate(newDimension) {
    return actionCreators.updateNewDateDimension(this.props.configurationId, newDimension);
  },

  close() {
    return this.setState({
      showModal: false
    });
  },

  open() {
    return this.setState({
      showModal: true
    });
  },

  getInitialState() {
    return { showModal: false };
  },

  render() {
    return (
      <span>
        {this.renderOpenButton()}
        <Modal bsSize="large" show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton={true}>
            {<Modal.Title>{this._title()}</Modal.Title>}
          </Modal.Header>
          <Modal.Body>
            <Tabs
              id="gooddata-writer-date-dimension-select-modal-tabs"
              className="tabs-inside-modal"
            >
              <Tab eventKey="select" title="Select from existing">
                {this.state.isLoading ? (
                  <p className="panel-body">Loading ...</p>
                ) : (
                  this._renderTable()
                )}
              </Tab>
              <Tab eventKey="new" title="Create new">
                <NewDimensionForm
                  isPending={this.state.isCreatingNewDimension}
                  dimension={this.state.newDimension}
                  onChange={this._handleNewDimensionUpdate}
                  onSubmit={this._handleNewDimensionSave}
                  buttonLabel="Create and select"
                />
              </Tab>
            </Tabs>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              <Button onClick={this.close} bsStyle="link">
                Close
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
      </span>
    );
  },

  _selectDimension(id) {
    this.props.onSelect({
      selectedDimension: id
    });
    return this.close();
  },

  _renderTable() {
    if (this.state.dimensions.count()) {
      return (
        <div className="table table-striped table-hover">
          <div className="thead">
            <div className="tr">
              <div className="th">Name</div>
              <div className="th">Include time</div>
              <div className="th">Selected</div>
            </div>
          </div>
          <div className="tbody">
            {this.state.dimensions
              .map(function(dimension) {
                return (
                  <a
                    className="tr"
                    key={dimension.get('name')}
                    onClick={this._selectDimension.bind(this, dimension.get('name'))}
                  >
                    <div className="td">{dimension.getIn(['data', 'name'])}</div>
                    <div className="td">
                      <Check isChecked={dimension.getIn(['data', 'includeTime'], false)} />
                    </div>
                    <div className="td">
                      {dimension.get('name') === this.props.column.get('dateDimension') && (
                        <Check isChecked />
                      )}
                    </div>
                  </a>
                );
              }, this)
              .toArray()}
          </div>
        </div>
      );
    } else {
      return <p className="panel-body">There are no date dimensions yet. Please create a new dimension.</p>;
    }
  },

  _title() {
    return `Date dimension for column ${this.props.column.get('name')}`;
  },

  renderOpenButton() {
    return (
      <span onClick={this.open} className="btn btn-link">
        <span className="fa fa-calendar" />{' '}
        {this.props.column.get('dateDimension') ? 'Change' : 'Add'}
      </span>
    );
  }
});
