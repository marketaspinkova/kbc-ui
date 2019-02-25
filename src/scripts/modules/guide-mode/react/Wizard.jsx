import React from 'react';
import WizardModal from './WizardModal';
import WizardStore from '../stores/WizardStore';
import { setDirection, setStep, setAchievedLesson, hideWizardModalFn } from '../stores/ActionCreators';
import createStoreMixin from '../../../react/mixins/createStoreMixin';

export default React.createClass({
  displayName: 'Wizard',

  propTypes: {
    projectBaseUrl: React.PropTypes.string.isRequired,
    scriptsBasePath: React.PropTypes.string.isRequired
  },

  mixins: [createStoreMixin(WizardStore)],

  getStateFromStores() {
    return {
      wizard: WizardStore.getState(),
      currentLesson: WizardStore.getCurrentLesson()
    };
  },

  applyLayoutClasses() {
    document.body.classList.add('guide-mode');
    if (typeof this.state.currentLesson !== 'undefined') {
      let wizardPosition = this.state.currentLesson.steps[this.state.wizard.step].position;
      document.body.classList.add('guide-mode-lesson-on');

      if (wizardPosition === 'center') {
        document.body.classList.add('guide-mode-center');
      } else {
        document.body.classList.remove('guide-mode-center');
      }
    } else {
      document.body.classList.remove('guide-mode-lesson-on');
    }
  },

  render() {
    this.applyLayoutClasses();

    if (this.state.wizard.lessonNumber === 0 || !this.state.wizard.showLessonModal) {
      return null;
    } else {
      return (
        <WizardModal
          projectBaseUrl={this.props.projectBaseUrl}
          step={this.state.wizard.step}
          achievedStep={this.state.wizard.achievedStep}
          setStep={setStep}
          setDirection={setDirection}
          direction={this.state.wizard.direction}
          setAchievedLessonFn={setAchievedLesson}
          show={this.state.wizard.showLessonModal}
          onHide={hideWizardModalFn}
          position="aside"
          lesson={this.state.currentLesson}
          backdrop={true}
          scriptsBasePath={this.props.scriptsBasePath}
        />
      );
    }
  }
});
