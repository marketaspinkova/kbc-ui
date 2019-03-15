import PropTypes from 'prop-types';
import React from 'react';
import {List} from 'immutable';
import { Panel, ListGroup, ListGroupItem } from 'react-bootstrap';
import {Loader} from '@keboola/indigo-ui';
import Tooltip from '../../../../react/common/Tooltip';
export default React.createClass({
  propTypes: {
    authToken: PropTypes.string.isRequired,
    file: PropTypes.object,
    selectSheet: PropTypes.func.isRequired,
    onSelectFile: PropTypes.func.isRequired

  },

  render() {
    const {file} = this.props;
    const isLoading = this.isLoading();
    const header = (
      <span>
        <span className="table">
          <span className="tbody">
            <span className="tr">
              <span className="td">
                {this.props.file.get('name')}
                {' '}
                {isLoading ? <Loader /> : null }
              </span>
            </span>
          </span>
        </span>
      </span>
    );
    return (
      <Panel
        onSelect={this.onPanelClick}
        header={header}
        expanded={file.get('isExpanded')}
        collapsible={true}
        key={file.get('id')}
        eventKey={file.get('id')}
      >
        {isLoading ? <span> Loading sheets... </span>
          :
          <div className="row">
            <ListGroup key={file.get('id')}>
              {this.getFileSheets().map(this.renderSheetItem).toArray()}
            </ListGroup>
          </div>
        }
      </Panel>

    );
  },

  isLoading() {
    return this.props.file.getIn(['sheetsApi', 'isLoading'], false);
  },

  selectSheet(sheet) {
    if (sheet.get('isSaved')) return;
    this.props.selectSheet(this.props.file, sheet);
  },

  renderSheetItem(sheet) {
    const item = (
      <ListGroupItem
        key={sheet.get('sheetId')}
        active={!!sheet.get('selected')}
        disabled={!!sheet.get('isSaved')}
        onClick={() => this.selectSheet(sheet)}
      >
        {sheet.get('sheetTitle')}
      </ListGroupItem>
    );
    return (
      sheet.get('isSaved') ?
        <Tooltip tooltip="Already configured in the project">
          {item}
        </Tooltip>
        : item

    );
  },

  getFileSheets() {
    return this.props.file.getIn(['sheetsApi', 'sheets'], List());
  },

  onPanelClick(eventKey, e) {
    e.preventDefault();
    e.stopPropagation();
    this.props.onSelectFile(this.props.file.get('id'));
  }
});
