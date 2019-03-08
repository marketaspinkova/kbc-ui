import React, {PropTypes} from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import {Button, Col, Checkbox, Radio, FormGroup, FormControl, ControlLabel, HelpBlock} from 'react-bootstrap';
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
          <FormGroup>
            <Col sm={3} componentClass={ControlLabel}>
              Name
            </Col>
            <Col sm={9}>
              <FormControl
                type="text"
                value={dimension.get('name')}
                onChange={this.handleInputChange.bind(this, 'name')}
              />
            </Col>
          </FormGroup>
          <FormGroup>
            <Col sm={9} smOffset={3}>
              <Checkbox
                checked={dimension.get('includeTime')}
                onChange={this.handleCheckboxChange.bind(this, 'includeTime')}
              >
                Include time
              </Checkbox>
            </Col>
          </FormGroup>
          <FormGroup bsSize="small">
            <Col sm={3} componentClass={ControlLabel}>
              Identifier
            </Col>
            <Col sm={9}>
              <FormControl
                type="text"
                value={dimension.get('identifier')}
                placeholder="Optional"
                onChange={this.handleInputChange.bind(this, 'identifier')}
              />
            </Col>
          </FormGroup>
          <FormGroup bsSize="sm">
            <Col sm={3} componentClass={ControlLabel}>
              Template
            </Col>
            <Col sm={9}>
              <Radio
                value={DateDimensionTemplates.GOOD_DATA}
                name="template"
                onChange={this.handleInputChange.bind(this, 'template')}
                checked={this.props.dimension.get('template') === DateDimensionTemplates.GOOD_DATA}
              >
                GoodData
              </Radio>
              <HelpBlock>
                Default date dimension provided by GoodData
              </HelpBlock>
            </Col>
          </FormGroup>
          <FormGroup bsSize="small">
            <Col sm={9} smOffset={3}>
              <Radio
                value={DateDimensionTemplates.KEBOOLA}
                name="template"
                onChange={this.handleInputChange.bind(this, 'template')}
                checked={this.props.dimension.get('template') === DateDimensionTemplates.KEBOOLA}
              >
                Keboola
              </Radio>
              <HelpBlock>{this.renderKeboolaDimHelp()}</HelpBlock>
            </Col>
          </FormGroup>
          <FormGroup bsSize="small">
            <Col sm={9} smOffset={3}>
              <Radio
                value={DateDimensionTemplates.CUSTOM}
                name="template"
                onChange={this.handleInputChange.bind(this, 'template')}
                checked={this.props.dimension.get('template') === DateDimensionTemplates.CUSTOM}
              >
                Custom
              </Radio>
              <HelpBlock>{this.renderCustomDimHelp()}</HelpBlock>
            </Col>
          </FormGroup>
          {this.customTemplateInput()}
          <FormGroup>
            <Col sm={9} smOffset={3}>
              <Button
                bsStyle="success"
                disabled={this.props.isPending || !this.isValid()}
                onClick={this.props.onSubmit}
              >
                {this.props.buttonLabel}
              </Button> {isPending ? <Loader/> : null}
            </Col>
          </FormGroup>
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
      <FormGroup bsSize="small">
        <Col sm={9} smOffset={3}>
          <FormControl
            type="text"
            placeholder="Your template id"
            value={this.props.dimension.get('customTemplate')}
            onChange={this.handleInputChange.bind(this, 'customTemplate')}
          />
        </Col>
      </FormGroup>
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
