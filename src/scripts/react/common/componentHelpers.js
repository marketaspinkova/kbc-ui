import React from 'react';
import { ExternalLink, Icon } from '@keboola/indigo-ui';

const getComponentType = (type) => {
  if (['extractor', 'writer', 'application'].includes(type)) {
    return type;
  }
  return 'component';
};

const getComponentBadges = (component) => {
  const complexity = component.get('complexity');
  const componentType = getComponentType(component.get('type'));
  let flags = component.get('flags');
  let badges = [];

  if (component.getIn(['data', 'vendor', 'licenseUrl'])) {
    flags = flags.push('hasLicence');
  }
  if (complexity) {
    flags = flags.push('complexity-' + complexity);
  }

  if (flags.contains('3rdParty')) {
    badges.push({
      title: <span>3<sup>rd</sup> party</span>,
      description: `This is a third-party ${componentType} supported by its vendor.`,
      descriptionPlain: `This is a third-party ${componentType} supported by its vendor.`,
      key: '3rdParty'
    });
  } else {
    badges.push({
      title: <span><Icon.Keboola className="badge-component-item-responsibility-icon" /> Keboola</span>,
      description: `Support for this ${componentType} is provided by Keboola.`,
      descriptionPlain: `Support for this ${componentType} is provided by Keboola.`,
      key: 'responsibility'
    });
  }
  if (flags.contains('excludeFromNewList')) {
    badges.push({
      title: 'Experimental',
      description: `This ${componentType} is not recommended for production use.`,
      descriptionPlain: `This ${componentType} is not recommended for production use.`,
      key: 'excludeFromNewList'
    });
  }
  if (flags.contains('appInfo.dataIn')) {
    badges.push({
      title: <span><i className="fa fa-cloud-download fa-fw"/> IN</span>,
      description: `This ${componentType} retrieves data from outside sources.`,
      descriptionPlain: `This ${componentType} retrieves data from outside sources.`,
      key: 'dataIn'
    });
  }
  if (flags.contains('appInfo.dataOut')) {
    badges.push({
      title: <span><i className="fa fa-cloud-upload fa-fw"/> OUT</span>,
      description: `This ${componentType} sends data outside of Keboola Connection.`,
      descriptionPlain: `This ${componentType} sends data outside of Keboola Connection.`,
      key: 'dataOut'
    });
  }
  if (flags.contains('appInfo.beta')) {
    badges.push({
      title: 'Beta',
      description: `The ${componentType} is public, but it's in beta stage.`,
      descriptionPlain: `The ${componentType} is public, but it's in beta stage.`,
      key: 'appInfo.beta'
    });
  }
  if (flags.contains('appInfo.fee')) {
    badges.push({
      title: <span><i className="fa fa-dollar fa-fw"/></span>,
      description: `There is an extra charge to use this ${componentType}.`,
      descriptionPlain: `There is an extra charge to use this ${componentType}.`,
      key: 'fee'
    });
  }
  if (flags.contains('appInfo.fullAccess')) {
    badges.push({
      title: <span><i className="fa fa-key fa-fw"/></span>,
      description: `This ${componentType} will have full access to the project including all its data.`,
      descriptionPlain: `This ${componentType} will have full access to the project including all its data.`,
      key: 'fullAccess'
    });
  }
  if (flags.contains('deprecated')) {
    badges.push({
      title: <span><i className="fa fa-exclamation-triangle fa-fw"/><i className="fa fa-clock-o fa-fw"/></span>,
      description: `This ${componentType} is deprecated.`,
      descriptionPlain: `This ${componentType} is deprecated.`,
      key: 'deprecated'
    });
  }
  if (flags.contains('hasLicence')) {
    badges.push({
      title: <span><i className="fa fa-file-text-o fa-fw"/></span>,
      description: <span>You agree to the <ExternalLink href={component.getIn(['data', 'vendor', 'licenseUrl'])}>vendor&apos;s license agreement</ExternalLink>.</span>,
      descriptionPlain: 'You agree to the vendor\'s license agreement.',
      key: 'license'
    });
  }
  if (flags.contains('complexity-hard')) {
    badges.push({
      title: (
        <span>
          <i className="fa fa-clock-o badge-component-item-complexity-icon"/>
          <i className="fa fa-clock-o badge-component-item-complexity-icon"/>
          <i className="fa fa-clock-o badge-component-item-complexity-icon"/>
        </span>),
      description: `Hard setup. You are required to have deep knowledge about this ${componentType}.`,
      descriptionPlain: `Hard setup. You are required to have deep knowledge about this ${componentType}.`,
      key: 'complexity'
    });
  }
  if (flags.contains('complexity-medium')) {
    badges.push({
      title: (
        <span>
          <i className="fa fa-clock-o badge-component-item-complexity-icon"/>
          <i className="fa fa-clock-o badge-component-item-complexity-icon"/>
        </span>),
      description: `Medium setup. You need to use documentation to set this ${componentType} up.`,
      descriptionPlain: `Medium setup. You need to use documentation to set this ${componentType} up.`,
      key: 'complexity'
    });
  }
  if (flags.contains('complexity-easy')) {
    badges.push({
      title: (
        <span>
          <i className="fa fa-clock-o badge-component-item-complexity-icon"/>
        </span>),
      description: `Easy setup. You can setup this ${componentType} in few minutes with just basic knowledge.`,
      descriptionPlain: `Easy setup. You can setup this ${componentType} in few minutes with just basic knowledge.`,
      key: 'complexity'
    });
  }
  if (component.get('documentationUrl')) {
    badges.push({
      title: (
        <span>
          <i className="fa fa-question-circle "/> Documentation
        </span>
      ),
      description: (
        <span>Additional documentation for this {componentType} is <ExternalLink href={component.get('documentationUrl')}>available.</ExternalLink></span>
      ),
      descriptionPlain: `Additional documentation for this ${componentType} is available.`,
      key: 'documentation'
    });
  }
  return badges;
};

const getComponentBadgesIncluding = (component, filter = []) => {
  return getComponentBadges(component).filter((badge) => {
    return filter.includes(badge.key);
  });
};

const getComponentBadgesExcluding = (component, filter = []) => {
  return getComponentBadges(component).filter((badge) => {
    return !filter.includes(badge.key);
  });
};

export {
  getComponentBadges,
  getComponentBadgesIncluding,
  getComponentBadgesExcluding
};
