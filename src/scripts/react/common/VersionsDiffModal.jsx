import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import moment from 'moment';
import {Map, List} from 'immutable';
import {Button, Modal} from 'react-bootstrap';
import {diffJson} from 'diff';
import DetailedDiff from './VersionsDiffModalComponents/DetailedDiff';
import date from '../../utils/date';

const COLOR_ADD = '#cfc';
const COLOR_REMOVE = '#fcc';

const PROPS_TO_COMPARE = ['configuration', 'description', 'name', 'rowsSortOrder', 'isDisabled'];

function prepareDiffObject(versionObj) {
  if (!versionObj) {
    return null;
  }
  let result = Map();
  for (let prop of PROPS_TO_COMPARE) {
    result = result.set(prop, versionObj.get(prop));
  }

  if (versionObj.has('rows')) {
    let rows = List();
    versionObj.get('rows').forEach((version) => {
      rows = rows.push(prepareDiffObject(version));
    });
    result = result.set('rows', rows);
  }
  return result.toJS();
}

function setSignToString(str, sign) {
  if (str[0] === '') {
    return sign + str.substr(1);
  } else {
    return sign + str;
  }
}

function preparseDiffParts(parts) {
  let previousPart = null;
  let result = [];
  for (let part of parts) {
    const isChanged = part.added || part.removed;
    if (!isChanged) {
      if (previousPart) result.push(previousPart);
      previousPart = null;
      result.push(part);
      // if part is added or removed
    } else if (previousPart) {
      const multiPart = {
        isMulti: true,
        first: previousPart,
        second: part
      };
      previousPart = null;
      result.push(multiPart);
    } else {
      previousPart = part;
    }
  }
  return result;
}

export default createReactClass({

  propTypes: {
    show: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    referentialVersion: PropTypes.object.isRequired,
    compareVersion: PropTypes.object.isRequired
  },

  getInitialState() {
    return {
      showChangedOnly: true
    };
  },

  shouldComponentUpdate(nextProps) {
    const thisShow = this.props.show;
    const nextShow = nextProps.show;
    return thisShow || nextShow;
  },

  render() {
    return (
      <Modal bsSize="large" show={this.props.show} onHide={this.props.onClose}>
        <Modal.Header closeButton>
          <Modal.Title>Compare</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ul>
            <li>
              <strong>{this.renderVersionInfo(this.props.referentialVersion)}</strong>
            </li>
            <li>
              <strong>{this.renderVersionInfo(this.props.compareVersion)}</strong>
            </li>
          </ul>
          {this.renderFilterRow()}
          {this.renderDiff()}
        </Modal.Body>
        <Modal.Footer>
          <Button
            bsStyle="link"
            onClick={this.props.onClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    );
  },

  renderFilterRow() {
    return (
      <div className="checkbox">
        <label>
          <input
            checked={this.state.showChangedOnly}
            type="checkbox"
            onChange={this.toggleShowChanged}
          />
          Show changed parts only
        </label>
      </div>
    );
  },

  toggleShowChanged(e) {
    const val = e.target.checked;
    this.setState({showChangedOnly: val});
  },

  versionDescription(version) {
    const desc = version.get('changeDescription') || 'No description';
    return `#${version.get('version')} (${desc}) `;
  },

  renderVersionInfo(version) {
    return (
      <span>
        {this.versionDescription(version)}
        {' '}
        <small>
          <span title={date.format(version.get('created'))}><i className="fa fa-fw fa-calendar" />{moment(version.get('created')).fromNow()}</span> by {version.getIn(['creatorToken', 'description'], 'unknown')}
        </small>
      </span>
    );
  },

  renderDiff() {
    if (!this.props.referentialVersion || !this.props.compareVersion || !this.props.show) {
      return null;
    }

    return (
      <div className="pre-scrollable" style={{margin: '0 -15px -15px -15px '}}>
        {preparseDiffParts(this.getDiff()).map((part, index) => {
          if (part.isMulti) {
            return <div key={index}>{this.renderMultiDiff(part.first, part.second)}</div>;
          }
          return <div key={index}>{this.renderSimplePreDiff(part)}</div>;
        })}
      </div>
    );
  },

  renderMultiDiff(firstPart, secondPart) {
    return (
      <div>
        {this.renderSimplePreDiff(firstPart)}
        <DetailedDiff
          firstPart={firstPart}
          firstPartDescription={this.versionDescription(this.props.referentialVersion)}
          secondPart={secondPart}
          secondPartDescription={this.versionDescription(this.props.compareVersion)}
        />
        {this.renderSimplePreDiff(secondPart)}
      </div>
    )
  },

  renderSimplePreDiff(part) {
    let val = part.value
      .replace(/\\'/g, "\'")
      .replace(/\\"/g, '\"');
    let color = '';
    if (part.added)   {
      color = COLOR_ADD;
      val = setSignToString(val, '+');
    }
    if (part.removed) {
      color = COLOR_REMOVE;
      val = setSignToString(val, '-');
    }
    const isChanged = [COLOR_ADD, COLOR_REMOVE].indexOf(color) >= 0;
    if (!isChanged && this.state.showChangedOnly) return null;

    const style = {
      'marginBottom': '0px',
      'borderRadius': '0',
      'border': 'none',
      'backgroundColor': color
    };

    return <pre style={style}>{val}</pre>;
  },

  getDiff() {
    const referenceData = prepareDiffObject(this.props.referentialVersion);
    const compareWithData = prepareDiffObject(this.props.compareVersion);
    const result = diffJson(compareWithData, referenceData);
    return result;
  }


});
