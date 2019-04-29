import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import _ from 'underscore';
import {createTwoFilesPatch} from 'diff';
import { Controlled as CodeMirror } from 'react-codemirror2'

function multiDiffValueToString(value) {
  if (_.isArray(value)) {
    return value.join(',');
  }
  if (!value) return '';
  return value.toString();
}

// reconstruct string(@strValue) back to json so we know what property we are comparing
// If @strValue does not seem to be in {property: value} format we reconstruct it as
// an array ie [@strValue]
function reconstructIncompleteJson(strValue) {
  let result = strValue.trim();
  if (result[0] !== '{') result = '{' + result;
  const lastIdx = () => result.length - 1;
  if (result[lastIdx()] === ',') {
    result = result.substr(0, lastIdx());
  }
  if (result[lastIdx()] !== '}') result = result + '}';
  try {
    return JSON.parse(result);
  } catch (e) {
    // parse as array
    let arrayResult = strValue.trim();
    const lastArrayResultIdx = () => arrayResult.length - 1;
    if (arrayResult[lastArrayResultIdx()] === ',') {
      arrayResult = arrayResult.substr(0, lastArrayResultIdx());
    }
    return JSON.parse(`[${arrayResult}]`);
  }
}

function getMultiPartsDiff(firstValue, secondValue, firstDescription, secondDescription) {
  const firstJson = reconstructIncompleteJson(firstValue);
  const secondJson = reconstructIncompleteJson(secondValue);
  let firstLines = [];
  let secondLines = [];
  for (let key of _.keys(firstJson)) {
    firstLines.push('comparing: ' + key);
    firstLines.push(multiDiffValueToString(firstJson[key]));
    secondLines.push('comparing: ' + key);
    secondLines.push(multiDiffValueToString(secondJson[key]));
  }
  return createTwoFilesPatch('Old version',
    'New version',
    firstLines.join('\n') + '\n',
    secondLines.join('\n') + '\n',
    secondDescription, firstDescription, {context: 1000});
}

export default createReactClass({
  propTypes: {
    firstPart: PropTypes.object.isRequired,
    secondPart: PropTypes.object.isRequired,
    firstPartDescription: PropTypes.string,
    secondPartDescription: PropTypes.string
  },

  getInitialState() {
    return {
      showDetails: false
    };
  },

  render() {
    if (!this.containLineBreaks()) return null;
    return (
      <div>
        <div className="text-center">
          <button
            className="btn btn-link btn-sm"
            onClick={() => this.setState({showDetails: !this.state.showDetails})}>
            <i className="fa fa-fw fa-arrows-v"/>
            {this.state.showDetails ? 'Hide Details' : 'Show detailed diff'}
          </button>
        </div>
        {this.state.showDetails ? this.renderCodeDitorDiff() : null}
      </div>
    );
  },

  renderCodeDitorDiff() {
    const multiDiff = getMultiPartsDiff(
      this.props.firstPart.value,
      this.props.secondPart.value,
      this.props.firstPartDescription,
      this.props.secondPartDescription
    );

    return (
      <CodeMirror
        editorDidMount={(editor) => editor.refresh()}
        value={multiDiff}
        options={{
          theme: 'solarized',
          mode: 'diff',
          lineNumbers: false,
          lineWrapping: false,
          readOnly: true
        }}
        style={{width: '100%'}}
      />
    );
  },

  containLineBreaks() {
    const {firstPart, secondPart} = this.props;
    const lineBreakChar = '\\n';
    return firstPart.value.indexOf(lineBreakChar) >= 0 || secondPart.value.indexOf(lineBreakChar) >= 0;
  }
});
