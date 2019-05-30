/*
  Entry point for non app pages, provides some basic parts implemented in React
*/
import 'react-app-polyfill/stable';
import * as helpers from './helpers';
import ProjectSelect from './react/layout/project-select/ProjectSelect';
import Wizard from './modules/guide-mode/react/Wizard';
import CurrentUser from './react/layout/CurrentUser';
import ProjectsList from './react/layout/project-select/List';
import NewProjectModal from './react/layout/NewProjectModal';
import UserLinks from './react/layout/UserLinks';
import ProjectOverview from './react/admin/project-graph/Index';
// New UI
import RegionSelect from './react/admin/login/RegionSelect';
import NewUiProjectsList from './react/admin/projects-list/ProjectList';
import NewUiCurrentUser from './react/admin/projects-list/CurrentUser';
import NewUiPendingInvitations from './react/admin/projects-list/PendingInvitations';

export default {
  helpers,
  parts: {
    ProjectSelect,
    GuideMode: {
      Wizard
    },
    CurrentUser,
    UserLinks,
    ProjectsList,
    NewProjectModal,
    admin: {
      ProjectOverview,
      RegionSelect,
      ProjectsList: NewUiProjectsList,
      CurrentUser: NewUiCurrentUser,
      PendingInvitations: NewUiPendingInvitations,
    }
  }
};
