import dispatcher from '../../../Dispatcher';
import { ActionTypes } from './SidebarToggleConstants';

export default {
  open: () => {
    dispatcher.handleViewAction({
      type: ActionTypes.SIDEBAR_TOGGLE_OPEN
    });
  },

  close: () => {
    dispatcher.handleViewAction({
      type: ActionTypes.SIDEBAR_TOGGLE_CLOSE
    });
  }
};
