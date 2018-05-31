import React from 'react';
import immutableMixin from 'react-immutable-render-mixin';
import Row from './ConfigurationRowsTableRow';
import classnames from 'classnames';
import Sortable from 'sortablejs';

require('./ConfigurationRowsTable.less');

export default React.createClass({
  mixins: [immutableMixin],

  propTypes: {
    rows: React.PropTypes.object.isRequired,
    configurationId: React.PropTypes.string.isRequired,
    componentId: React.PropTypes.string.isRequired,
    component: React.PropTypes.object.isRequired,
    columns: React.PropTypes.object,
    rowDelete: React.PropTypes.func.isRequired,
    rowEnableDisable: React.PropTypes.func.isRequired,
    rowDeletePending: React.PropTypes.func.isRequired,
    rowEnableDisablePending: React.PropTypes.func.isRequired,
    rowLinkTo: React.PropTypes.string.isRequired,
    onOrder: React.PropTypes.func.isRequired,
    orderPending: React.PropTypes.object.isRequired,
    disabledMove: React.PropTypes.bool.isRequired
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
    const props = this.props;
    const state = this.state;
    return this.props.rows.map(function(row, rowIndex) {
      const thisRowOrderPending = props.orderPending.get(row.get('id'), false);
      const rowsOrderPending = props.orderPending.count() > 0;
      let disabledMoveLabel;
      if (rowsOrderPending) {
        disabledMoveLabel = 'Order saving';
      } else {
        disabledMoveLabel = 'Clear search query to allow changing order';
      }
      return (
        <Row
          columns={props.columns}
          row={row}
          componentId={props.componentId}
          component={props.component}
          configurationId={props.configurationId}
          key={state.sortableKeyPrefix + '_' + row.get('id')}
          rowNumber={rowIndex + 1}
          linkTo={props.rowLinkTo}
          isDeletePending={props.rowDeletePending(row.get('id'))}
          onDelete={function() {
            return props.rowDelete(row.get('id'));
          }}
          isEnableDisablePending={props.rowEnableDisablePending(row.get('id'))}
          onEnableDisable={function() {
            return props.rowEnableDisable(row.get('id'));
          }}
          disabledMove={props.disabledMove || rowsOrderPending}
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
