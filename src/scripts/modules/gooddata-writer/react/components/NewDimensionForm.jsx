import React, {PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Input} from './../../../../react/common/KbcBootstrap';
import {Button} from 'react-bootstrap';
import {Loader, ExternalLink} from '@keboola/indigo-ui';
import {DateDimensionTemplates} from '../../constants';

export default React.createClass({
  propTypes: {
    isPending: PropTypes.bool.isRequired,
    onSubmit: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    dimension: PropTypes.object.isRequired,
    className: PropTypes.string,
    buttonLabel: PropTypes.string
  },

  mixins: [PureRenderMixin],

  getDefaultProps() {
    return {
      className: 'form-horizontal',
      buttonLabel: 'Create'
    };
  },

  render() {
    const {dimension, className, isPending} = this.props;
    return (
      <div>
        <h3>Add Dimension</h3>
        <div className={className}>
          <Input
            type="text"
            label="Name"
            value={dimension.get('name')}
            onChange={this.handleInputChange.bind(this, 'name')}
            labelClassName="col-sm-3"
            wrapperClassName="col-sm-9"
          />
          <Input
            type="checkbox"
            label="Include time"
            checked={dimension.get('includeTime')}
            onChange={this.handleCheckboxChange.bind(this, 'includeTime')}
            wrapperClassName="col-sm-offset-3 col-sm-9"
          />
          <Input
            type="text"
            label="Identifier"
            value={dimension.get('identifier')}
            placeholder="Optional"
            onChange={this.handleInputChange.bind(this, 'identifier')}
            labelClassName="col-sm-3"
            wrapperClassName="col-sm-9"
            bsSize="small"
          />
          <div className="form-group form-group-sm">
            <div className="control-label col-sm-3">
              Template
            </div>
            <div className="col-sm-9">
              <div className="radio">
                <label>
                  <input
                    type="radio"
                    value={DateDimensionTemplates.GOOD_DATA}
                    name="template"
                    onChange={this.handleInputChange.bind(this, 'template')}
                    checked={this.props.dimension.get('template') === DateDimensionTemplates.GOOD_DATA}
                  />
                  <span>GoodData</span>
                </label>
              </div>
              <span className="help-block">
                <small>
                  Default date dimension provided by GoodData
                </small>
              </span>
            </div>
          </div>
          <Input
            type="radio"
            label="Keboola"
            value={DateDimensionTemplates.KEBOOLA}
            help={this.renderKeboolaDimHelp()}
            name="template"
            onChange={this.handleInputChange.bind(this, 'template')}
            checked={this.props.dimension.get('template') === DateDimensionTemplates.KEBOOLA}
            wrapperClassName="col-sm-offset-3 col-sm-9"
            bsSize="small"
          />
          <Input
            type="radio"
            label="Custom"
            value={DateDimensionTemplates.CUSTOM}
            help={this.renderCustomDimHelp()}
            name="template"
            onChange={this.handleInputChange.bind(this, 'template')}
            checked={this.props.dimension.get('template') === DateDimensionTemplates.CUSTOM}
            wrapperClassName="col-sm-offset-3 col-sm-9"
            bsSize="small"
          />
          {this.customTemplateInput()}
          <div className="form-group">
            <div className="col-sm-offset-3 col-sm-10">
              <Button
                bsStyle="success"
                disabled={this.props.isPending || !this.isValid()}
                onClick={this.props.onSubmit}
              >
                {this.props.buttonLabel}
              </Button> {isPending ? <Loader/> : null}
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderKeboolaDimHelp() {
    return (
      <small>
        Default date dimension provided by Keboola. Added all week setups: Mon-Sun, Tue-Mon, Wed-Tue, Thu-Wed, Fri-Thu, Sat-Fri, Sun-Sat + Boolean value whether its weekend or working day
      </small>
    );
  },

  renderCustomDimHelp() {
    return (
      <small>
        Provide your own template. You can generate the csv file containing all necessary details and provide it to GoodData.
        More info:{' '}
        <ExternalLink href="http://wiki.keboola.com/pure-gooddata-hints/custom-date-dimensions">
           Custom date dimmensions
        </ExternalLink>
      </small>
    );
  },

  customTemplateInput() {
    if (this.props.dimension.get('template') !== DateDimensionTemplates.CUSTOM) {
      return null;
    }
    return (
      <Input
        type="text"
        bsSize="small"
        placeholder="Your template id"
        wrapperClassName="col-sm-offset-3 col-sm-9"
        value={this.props.dimension.get('customTemplate')}
        onChange={this.handleInputChange.bind(this, 'customTemplate')}
      />
    );
  },

  isValid() {
    if (!this.props.dimension.get('name').trim().length) {
      return false;
    }

    if (this.props.dimension.get('template') === DateDimensionTemplates.CUSTOM &&
        !this.props.dimension.get('customTemplate').trim().length) {
      return false;
    }

    return true;
  },

  handleInputChange(field, e) {
    this.props.onChange(this.props.dimension.set(field, e.target.value));
  },

  handleCheckboxChange(field, e) {
    this.props.onChange(this.props.dimension.set(field, e.target.checked));
  }

});
