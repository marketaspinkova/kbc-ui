import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Immutable from 'immutable';
import moment from 'moment';
import { AlertBlock } from '@keboola/indigo-ui';

import StringUtils from '../../../utils/string';
import ComponentDetailLink from '../../../react/common/ComponentDetailLink';
import ComponentName from '../../../react/common/ComponentName';

export default createReactClass({
  propTypes: {
    components: PropTypes.object
  },

  render() {
    const deprecatedComponents = this.props.components.filter(function(component) {
      return !!component.get('flags', Immutable.List()).contains('deprecated');
    });

    if (deprecatedComponents.isEmpty()) {
      return null;
    }

    const grouped = deprecatedComponents.groupBy(function(component) {
      return component.get('type');
    });

    return (
      <AlertBlock type="warning" title="Project contains deprecated components">
        <div className="row">
          {grouped.entrySeq().map(function([type, components]) {
            return (
              <div className="col-md-6" key={type}>
                <h4>
                  <span className={'kbc-' + type + '-icon'}/>
                  {StringUtils.capitalize(type)}s
                </h4>
                <ul className="list-unstyled">
                  {components.entrySeq().map(function([index, component]) {
                    return (
                      <li key={index}>
                        <ComponentDetailLink
                          type={component.get('type')}
                          componentId={component.get('id')}
                        >
                          <ComponentName component={component} />
                          {component.get('expiredOn') && (
                            <span>
                              {' '}(Deprecated in {moment(component.get('expiredOn')).format('MMM YYYY')})
                            </span>
                          )}
                        </ComponentDetailLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </AlertBlock>
    );
  }
});
