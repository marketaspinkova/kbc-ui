import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import CreatedWithIcon from '../../../../react/common/CreatedWithIcon';
import ImmutableRendererMixin from 'react-immutable-render-mixin';
import VersionIcon from './VersionIcon';

export default createReactClass({
  mixins: [ImmutableRendererMixin],

  propTypes: {
    version: PropTypes.object.isRequired,
    isLast: PropTypes.bool
  },

  getDefaultProps: function() {
    return {
      isLast: false
    };
  },

  getVersionDescription() {
    if (this.props.version.get('changeDescription')) {
      return this.props.version.get('changeDescription');
    } else {
      return (
        <small className="text-muted">No description</small>
      );
    }
  },

  render: function() {
    return (
      <span className="table">
        <span className="tr">
          <span className="td versions-status">
            <VersionIcon
              isLast={this.props.isLast}
            />
          </span>
          <span className="td kbc-break-all kbc-break-word">
            <div>
              {this.getVersionDescription()}
            </div>
            <div>
              {this.props.version.getIn(['creatorToken', 'description'], 'unknown')}
            </div>
            <div>
              <small className="text-muted pull-left">
                #{this.props.version.get('version')}
              </small>
              <small className="text-muted pull-right">
                <CreatedWithIcon
                  createdTime={this.props.version.get('created')}
                  tooltipPlacement="bottom"
                />
              </small>
            </div>
          </span>
        </span>
      </span>
    );
  }
});
