import React from 'react';
import PureRenderMixin from 'react-addons-pure-render-mixin';
import ComponentConfigurationRowLink from '../ComponentConfigurationRowLink';

export default (bucketId, transformationId, errors, onClick) => {
  return React.createClass({
    mixins: [PureRenderMixin],

    propTypes: {
      onClick: React.PropTypes.func.isRequired
    },

    render() {
      return (
        <span>
          SQL Validation found{' '}
          <ComponentConfigurationRowLink
            componentId="transformation"
            configId={bucketId}
            rowId={transformationId}
            onClick={() => {
              this.props.onClick();
              onClick();
            }}
          >
            <b>
              {errors} error
              {errors > 1 ? 's' : ''}.
            </b>
          </ComponentConfigurationRowLink>
        </span>
      );
    }
  });
};
