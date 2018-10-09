import dispatcher from '../../../Dispatcher';
import { ActionTypes } from './MenuToggleConstants';

export default {
  open: () => {
    dispatcher.handleViewAction({
      type: ActionTypes.MENU_TOGGLE_OPEN
    });
  },

  close: () => {
    dispatcher.handleViewAction({
      type: ActionTypes.MENU_TOGGLE_CLOSE
    });
  }
};
