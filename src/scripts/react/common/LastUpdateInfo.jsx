import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
export default React.createClass({
  propTypes: {
    lastVersion: PropTypes.object.isRequired
  },

  render() {
    const lastVersion = this.props.lastVersion;
    const fromMoment = moment(lastVersion.get('created')).fromNow();
    const creator =  lastVersion.getIn(['creatorToken', 'description'], 'unknown');
    const description = lastVersion.get('changeDescription') || 'No description.';
    const versionNumber = `# ${lastVersion.get('version')}`;
    return (
      <div>
        <small>
          Last update {fromMoment} by {creator}
          <br/>
          {versionNumber} {description}
        </small>
      </div>
    );
  }


});
