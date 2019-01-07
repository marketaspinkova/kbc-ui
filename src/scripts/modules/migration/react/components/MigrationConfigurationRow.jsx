import React, { PropTypes } from 'react';
// import DeleteButton from '../../../../react/common/DeleteButton';
import { Finished } from '@keboola/indigo-ui';
// import Tooltip from '../../../../react/common/Tooltip';
import descriptionExcerpt from '../../../../utils/descriptionExcerpt';
import PureRenderMixin from 'react-addons-pure-render-mixin';

export default React.createClass({
  mixins: [PureRenderMixin],

  propTypes: {
    config: PropTypes.object.isRequired,
    component: PropTypes.object.isRequired,
    componentId: PropTypes.string.isRequired,
    isMigrating: PropTypes.bool.isRequired
  },

  render() {
    return (
      <span className="tr">
        <span className="td">
          <strong>{this.props.config.get('name', '---')}</strong>
          {this.description()}
        </span>
        <span className="td text-right kbc-component-buttons">
          <span className="kbc-component-author">
            Migrated by <strong>{this.props.config.getIn(['currentVersion', 'creatorToken', 'description'])}</strong>{' '}
            <Finished endTime={this.props.config.getIn(['currentVersion', 'created'])} />
          </span>
        </span>
      </span>
    );
  },

  // buttons() {
  //   return (
  //     <span>
  //       <DeleteButton
  //         tooltip="Delete Forever"
  //         icon="fa-times"
  //         isPending={this.props.isMigrating}
  //         confirm={this.confirmProps()}
  //       />
  //     </span>
  //   );
  // },

  description() {
    if (!this.props.config.get('description')) {
      return null;
    }
    return (
      <div>
        <small>{descriptionExcerpt(this.props.config.get('description'))}</small>
      </div>
    );
  },

  confirmMessage() {
    return <span>Are you sure you want to migrate this configuration {this.props.config.get('name')}?</span>;
  },

  confirmProps() {
    return {
      title: 'Delete Forever',
      buttonType: 'success',
      text: this.confirmMessage(),
      onConfirm: this.migrate
    };
  },

  migrate() {
    return {};
  }
});
