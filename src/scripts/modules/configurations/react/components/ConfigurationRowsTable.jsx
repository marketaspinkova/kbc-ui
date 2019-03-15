import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import immutableMixin from 'react-immutable-render-mixin';
import Row from './ConfigurationRowsTableRow';
import classnames from 'classnames';
import Sortable from 'sortablejs';

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
      dragging: false,
      draggedIndex: null,
      sortableKeyPrefix: Math.random()
    };
  },

  componentDidMount() {
    const component = this;
    const sortableOptions = {
      sort: true,
      disabled: this.props.disabledMove || this.props.orderPending.count() > 0,
      handle: '.drag-handle',
      forceFallback: true,
      animation: 100,
      onStart: function() {
        component.setState({
          dragging: true,
          draggedIndex: null
        });
      },
      onEnd: function(e) {
        component.setState({
          dragging: false,
          draggedIndex: e.newIndex
        });
      },
      store: {
        get: function() {
          return component.props.rows.map(function(row) {
            return row.get('id');
          }).toJS();
        },
        set: function(sortable) {
          const orderedIds = sortable.toArray();
          component.props.onOrder(orderedIds, orderedIds[component.state.draggedIndex]);
          // to avoid resorting after re-render
          // https://github.com/RubaXa/Sortable/issues/844#issuecomment-219180426
          component.setState({
            sortableKeyPrefix: Math.random(),
            draggedIndex: null
          });
        }
      }
    };
    Sortable.create(this.refs.list, sortableOptions);
  },

  renderHeader() {
    return this.props.columns.map(function(columnDefinition, index) {
      return (
        <span className="th" key={index}>
          <strong>{columnDefinition.get('name')}</strong>
        </span>
      );
    });
  },

  renderTableRows() {
    const state = this.state;
    return this.props.rows.map((row, rowIndex) => {
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
          columns={this.props.columns}
          row={row}
          componentId={this.props.componentId}
          component={this.props.component}
          configurationId={this.props.configurationId}
          key={state.sortableKeyPrefix + '_' + row.get('id')}
          rowNumber={rowIndex + 1}
          linkTo={this.props.rowLinkTo}
          isDeletePending={this.props.rowDeletePending(row.get('id'))}
          onDelete={() => {
            return this.props.rowDelete(row.get('id'));
          }}
          isEnableDisablePending={this.props.rowEnableDisablePending(row.get('id'))}
          onEnableDisable={() => {
            return this.props.rowEnableDisable(row.get('id'));
          }}
          disabledMove={this.props.disabledMove || rowsOrderPending}
          disabledMoveLabel={disabledMoveLabel}
          orderPending={thisRowOrderPending}
        />
      );
    }).toList().toJS();
  },

  render() {
    return (
      <div className={classnames(
        'table-config-rows',
        'table',
        'table-striped',
        {
          'table-hover': !this.state.dragging
        }
      )}>
        <div className="thead" key="table-header">
          <div className="tr">
            <span className="th" key="dummy" />
            <span className="th" key="row-number">#</span>
            {this.renderHeader()}
          </div>
        </div>
        <div className="tbody" ref="list">
          {this.renderTableRows()}
        </div>
      </div>
    );
  }
});
