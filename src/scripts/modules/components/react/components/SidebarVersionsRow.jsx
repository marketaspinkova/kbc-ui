import React from 'react';
import CreatedWithIcon from '../../../../react/common/CreatedWithIcon';
import ImmutableRendererMixin from '../../../../react/mixins/ImmutableRendererMixin';
import VersionIcon from './VersionIcon';

module.exports = React.createClass({
  displayName: 'LatestVersionsRow',
  mixins: [ImmutableRendererMixin],
  propTypes: {
    version: React.PropTypes.object.isRequired,
    versionsLinkTo: React.PropTypes.string.isRequired,
    versionsLinkParams: React.PropTypes.object.isRequired,
    isLast: React.PropTypes.bool
  },
  getDefaultProps: function() {
    return {
      isLast: false
    };
  },

  getVersionDescription() {
    return this.props.version.get('changeDescription') || 'No description.';
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
          <span className="td">
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
