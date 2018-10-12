import React from 'react';

import ApplicationStore from '../../../../stores/ApplicationStore';
import { Image, Label } from 'react-bootstrap';

import backendLogoR from '../../../../../images/backend-logo-r.svg';
import backendLogoMySql from '../../../../../images/backend-logo-mysql.svg';
import backendLogoPython from '../../../../../images/backend-logo-python.svg';
import backendLogoOpenRefine from '../../../../../images/backend-logo-openrefine.svg';
import backendLogoSnowflake from '../../../../../images/backend-logo-snowflake.svg';
import backendLogoRedshift from '../../../../../images/backend-logo-redshift.svg';

const paths = {
  r: backendLogoR,
  mysql: backendLogoMySql,
  python: backendLogoPython,
  openrefine: backendLogoOpenRefine,
  snowflake: backendLogoSnowflake,
  redshift: backendLogoRedshift
};

const backendNames = {
  r: 'R',
  mysql: 'MySQL',
  python: 'Python',
  openrefine: 'OpenRefine (beta)',
  snowflake: 'Snowflake',
  redshift: 'Redshift'
};

export default React.createClass({
  propTypes: {
    backend: React.PropTypes.string.isRequired,
    type: React.PropTypes.string
  },

  render() {
    const backendName = this._resolveBackendName();
    if (backendName !== '') {
      return (
        <span className="label-backend-wrap">
          {this._renderBackendLogo(backendName)}
          {this._renderBackendLabel(backendName)}
        </span>
      );
    }
    return null;
  },

  _renderBackendLogo(backendName) {
    const imgPath = ApplicationStore.getScriptsBasePath() + paths[backendName];
    return <Image src={imgPath} width="19px" height="19px" className="label-backend-image" />;
  },

  _renderBackendLabel(backendName) {
    return (
      <Label className="label-backend">
        {backendNames[backendName]}
      </Label>
    );
  },

  _resolveBackendName() {
    if (this.props.backend === 'docker') {
      return this.props.type;
    } else {
      return this.props.backend;
    }
  }
});
