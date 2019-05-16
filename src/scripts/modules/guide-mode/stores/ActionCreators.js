import Dispatcher from '../../../Dispatcher';

export const ActionTypes = {
  GUIDE_MODE_UPDATE_MODAL_STATE: 'GUIDE_MODE_UPDATE_MODAL_STATE',
  GUIDE_MODE_SET_STEP: 'GUIDE_MODE_SET_STEP',
  GUIDE_MODE_SET_DIRECTION: 'GUIDE_MODE_SET_DIRECTION',
  GUIDE_MODE_SET_ACHIEVED_LESSON: 'GUIDE_MODE_SET_ACHIEVED_LESSON'
};

export const hideWizardModalFn = () => {
  Dispatcher.handleViewAction({
    type: ActionTypes.GUIDE_MODE_UPDATE_MODAL_STATE,
    showLessonModal: false,
    lessonNumber: 0
  });
};

export const setStep = (newStep) => {
  Dispatcher.handleViewAction({
    type: ActionTypes.GUIDE_MODE_SET_STEP,
    step: newStep
  });
};

export const setDirection = (newDirection) => {
  Dispatcher.handleViewAction({
    type: ActionTypes.GUIDE_MODE_SET_DIRECTION,
    direction: newDirection
  });
};

export const setAchievedLesson = (lessonId) => {
  Dispatcher.handleViewAction({
    type: ActionTypes.GUIDE_MODE_SET_ACHIEVED_LESSON,
    lessonId: lessonId
  });
};

export const showWizardModalFn = (lessonNumber) => {
  Dispatcher.handleViewAction({
    type: ActionTypes.GUIDE_MODE_UPDATE_MODAL_STATE,
    showLessonModal: true,
    step: 0,
    lessonNumber: lessonNumber
  });
};
