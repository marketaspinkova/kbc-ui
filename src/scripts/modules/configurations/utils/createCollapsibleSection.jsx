import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import SaveButtons from '../../../react/common/SaveButtons';
import { PanelGroup, Panel } from 'react-bootstrap';
import classnames from 'classnames';
import './createCollapsibleSection.less';

export default (TitleComponent, InnerComponent, options = {}) => {
  const {
    includeSaveButtons = false, // whether render save buttons
    stretchContentToBody = false // wheter strech content to full width of panel body
  } = options;
  return createReactClass({

    displayName: 'CollapsibleSection',

    propTypes: {
      disabled: PropTypes.bool,
      isComplete: PropTypes.bool,
      onSave: PropTypes.func,
      onChange: PropTypes.func,
      value: PropTypes.any,
      actions: PropTypes.any
    },

    getInitialState() {
      return {
        isChanged: false,
        initValue: this.props.value,
        contentManuallyOpen: null
      };
    },

    isAccordionOpen() {
      if (this.state.contentManuallyOpen !== null) {
        return this.state.contentManuallyOpen;
      }

      if (this.state.isChanged) {
        return true;
      }

      return !this.props.isComplete;
    },

    accordionArrow() {
      if (this.isAccordionOpen()) {
        return (<span className="fa fa-fw fa-angle-down" />);
      }
      return (<span className="fa fa-fw fa-angle-right" />);
    },

    accordionHeader() {
      return (
        <span>
          <span className="table">
            <span className="tbody">
              <span className="tr">
                <span className="td">
                  <h4>
                    {this.accordionArrow()}
                    <TitleComponent value={this.props.value}/>
                  </h4>
                </span>
              </span>
            </span>
          </span>
        </span>
      );
    },

    renderButtons() {
      return (
        <div className="form-group">
          <div className="text-right">
            <SaveButtons
              isSaving={this.props.disabled}
              isChanged={this.state.isChanged}
              onSave={this.handleSave}
              onReset={this.handleReset}
            />
            <br />
          </div>
        </div>
      );
    },

    handleReset() {
      this.setState({isChanged: false});
      this.props.onChange(this.state.initValue);
    },

    handleSave() {
      this.props.onSave(this.props.value).then(
        () => this.setState({isChanged: false, initValue: this.props.value})
      );
    },

    handleChange(diff) {
      this.setState({isChanged: true});
      this.props.onChange(diff);
    },

    renderContent() {
      return (
        <InnerComponent
          disabled={this.props.disabled}
          onChange={this.handleChange}
          onSave={this.props.onSave}
          value={this.props.value}
          actions={this.props.actions}
        />);
    },

    render() {
      const panelClassNames = {
        'kbc-accordion': true,
        'kbc-panel-heading-with-table': true,
        'collapsible-section-content-no-padding': stretchContentToBody
      };
      return (
        <PanelGroup
          accordion={true}
          className={classnames(panelClassNames)}
          activeKey={this.isAccordionOpen() ? 'content' : ''}
          onSelect={activeTab => activeTab === 'content' && this.setState({contentManuallyOpen: !this.isAccordionOpen()})}
        >
          <Panel
            header={this.accordionHeader()}
            eventKey="content"
          >
            {includeSaveButtons && this.renderButtons()}
            {this.renderContent()}
          </Panel>
        </PanelGroup>
      );
    }

  });
};
