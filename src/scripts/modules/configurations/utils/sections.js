import { Map } from 'immutable';
import TablesStore from '../../components/stores/StorageTablesStore';

const repass = param => param;
const returnTrue = () => true;

function parseBySections(sectionsParseFn, conformFn, configuration) {
  const tables = TablesStore.getAll();
  const conformedConfiguration = conformFn(configuration);
  const sectionsParsed = sectionsParseFn.map(parseSectionFn => parseSectionFn(conformedConfiguration, tables));
  return sectionsParsed;
}

function createBySections(sectionsCreateFn, configurationBySections) {
  const configuration = configurationBySections
    .reduce((memo, sectionConfig, index) => {
      const createSectionFn = sectionsCreateFn.get(index);
      return memo.mergeDeep(createSectionFn(sectionConfig));
    }, Map());

  return configuration;
}

function createEmptyConfigBySections(
  sectionsCreateEmptyFn,
  name,
  webalizedName
) {
  const configuration = sectionsCreateEmptyFn
    .reduce(function(memo, sectionCreateEmptyFn) {
      return memo.mergeDeep(sectionCreateEmptyFn(name, webalizedName));
    }, Map());
  return configuration;
}

function isCompleteBySections(sectionsIsCompleteFn, configuration) {
  const sectionsIsComplete = sectionsIsCompleteFn.reduce((memo, isCompleteFn) => {
    return memo && isCompleteFn(configuration);
  }, true);
  return sectionsIsComplete;
}

export default {
  makeParseFn(sections, conformFn) {
    const sectionsParseFn = sections.map(section => section.get('onLoad') || repass);
    return configuration => parseBySections(sectionsParseFn, conformFn || repass, configuration);
  },

  makeCreateFn(sections) {
    const sectionsCreateFn = sections.map(section => section.get('onSave') || repass);
    return configuration => createBySections(sectionsCreateFn, configuration);
  },

  makeCreateEmptyFn(sections) {
    const sectionsCreateEmptyFn = sections.map(function(section) {
      if (section.has('onCreate')) {
        return section.get('onCreate');
      }
      // default, return onSave with empty localState
      return function() {
        return section.get('onSave')(Map());
      };
    });
    return (name, webalizedName) =>
      createEmptyConfigBySections(
        sectionsCreateEmptyFn,
        name,
        webalizedName
      );
  },

  isComplete(sections, configuration) {
    const sectionsIsCompleteFn = sections.map(section => section.get('isComplete', returnTrue));
    return isCompleteBySections(sectionsIsCompleteFn, configuration);
  }
};
