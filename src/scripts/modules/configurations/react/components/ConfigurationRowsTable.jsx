import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import classnames from 'classnames';
import Sortable from 'react-sortablejs';
import immutableMixin from 'react-immutable-render-mixin';
import Row from './ConfigurationRowsTableRow';

export default createReactClass({
  mixins: [immutableMixin],

  propTypes: {
    rows: PropTypes.object.isRequired,
    configurationId: PropTypes.string.isRequired,
    componentId: PropTypes.string.isRequired,
    component: PropTypes.object.isRequired,
    columns: PropTypes.object,
    rowDelete: PropTypes.func.isRequired,
    rowEnableDisable: PropTypes.func.isRequired,
    rowDeletePending: PropTypes.func.isRequired,
    rowEnableDisablePending: PropTypes.func.isRequired,
    rowLinkTo: PropTypes.string.isRequired,
    onOrder: PropTypes.func.isRequired,
    orderPending: PropTypes.object.isRequired,
    disabledMove: PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      dragging: false
    };
  },

  render() {
    return (
      <div
        className={classnames('table-config-rows', 'table', 'table-striped', {
          'no-hover': this.state.dragging
        })}
      >
        <div className="thead">
          <div className="tr">
            <span className="th" />
            <span className="th">
              #
            </span>
            {this.renderHeader()}
          </div>
        </div>
        <Sortable
          className="tbody"
          options={{
            disabled: this.props.disabledMove || this.props.orderPending.count() > 0,
            handle: '.drag-handle',
            animation: 100,
            onStart: () => this.setState({ dragging: true }),
            onEnd: () => this.setState({ dragging: false })
          }}
          onChange={(order, sortable, event) => this.props.onOrder(order, order[event.newIndex])}
        >
          {this.renderTableRows()}
        </Sortable>
      </div>
    );
  },

  renderHeader() {
    return this.props.columns.map((columnDefinition, index) => {
      return (
        <span className="th" key={index}>
          <strong>{columnDefinition.get('name')}</strong>
        </span>
      );
    });
  },

  renderTableRows() {
    return this.props.rows
      .map((row, rowIndex) => {
        const thisRowOrderPending = this.props.orderPending.get(row.get('id'), false);
        const rowsOrderPending = this.props.orderPending.count() > 0;
        let disabledMoveLabel;
        if (rowsOrderPending) {
          disabledMoveLabel = 'Order saving';
        } else {
          disabledMoveLabel = 'Clear search query to allow changing order';
        }

        return (
          <Row
            key={row.get('id')}
            columns={this.props.columns}
            row={row}
            componentId={this.props.componentId}
            component={this.props.component}
            configurationId={this.props.configurationId}
            rowNumber={rowIndex + 1}
            linkTo={this.props.rowLinkTo}
            isDeletePending={this.props.rowDeletePending(row.get('id'))}
            onDelete={() => this.props.rowDelete(row.get('id'))}
            isEnableDisablePending={this.props.rowEnableDisablePending(row.get('id'))}
            onEnableDisable={() => this.props.rowEnableDisable(row.get('id'))}
            disabledMove={this.props.disabledMove || rowsOrderPending}
            disabledMoveLabel={disabledMoveLabel}
            orderPending={thisRowOrderPending}
          />
        );
      })
      .toList()
      .toJS();
  }
});
