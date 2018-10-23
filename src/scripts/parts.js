/*
  Entry point for non app pages, provides some basic parts implemented in React
*/
import './utils/react-shim';
import * as helpers from './helpers';
import ProjectSelect from './react/layout/project-select/ProjectSelect';
import Wizard from './modules/guide-mode/react/Wizard';
import CurrentUser from './react/layout/CurrentUser';
import ProjectsList from './react/layout/project-select/List';
import NewProjectModal from './react/layout/NewProjectModal';

export default {
  helpers,
  parts: {
    ProjectSelect,
    GuideMode: {
      Wizard
    },
    CurrentUser,
    ProjectsList,
    NewProjectModal
  }
};
