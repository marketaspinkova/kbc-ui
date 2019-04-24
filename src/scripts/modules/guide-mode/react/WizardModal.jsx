import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import {Modal, ListGroupItem, ListGroup, Button} from 'react-bootstrap';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Remarkable from 'react-remarkable';
import RoutesStore from '../../../stores/RoutesStore';
import { hideWizardModalFn, showWizardModalFn } from '../stores/ActionCreators.js';
import GuideModeImage from './GuideModeImage';

export default createReactClass({
  propTypes: {
    onHide: PropTypes.func.isRequired,
    setStep: PropTypes.func.isRequired,
    setDirection: PropTypes.func.isRequired,
    setAchievedLessonFn: PropTypes.func.isRequired,
    show: PropTypes.bool.isRequired,
    backdrop: PropTypes.bool.isRequired,
    position: PropTypes.string.isRequired,
    direction: PropTypes.string.isRequired,
    step: PropTypes.number.isRequired,
    achievedStep: PropTypes.number.isRequired,
    lesson: PropTypes.object.isRequired,
    projectBaseUrl: PropTypes.string.isRequired,
    scriptsBasePath: PropTypes.string.isRequired
  },

  render() {
    return (
      <div>
        <Modal
          show={this.props.show} onHide={this.closeLessonModal} backdrop={this.isStepBackdrop()}
          className={'guide-wizard guide-wizard-' + this.getStepPosition()}
        >
          <Modal.Header closeButton>
            { this.getStepPosition() === 'center' ? (
              this.getModalTitleExtended()
            ) : (
              this.getModalTitle()
            )}
          </Modal.Header>
          <Modal.Body className="guide-modal-body">
            <TransitionGroup>
              <CSSTransition
                key={this.props.step}
                classNames={'guide-wizard-animated-' + this.props.direction}
                timeout={200}
              >
                {this.getModalBody()}
              </CSSTransition>
            </TransitionGroup>
          </Modal.Body>
          <Modal.Footer>
            {this.hasPreviousStep() && this.renderButtonPrev()}
            {this.renderButtonNext()}
          </Modal.Footer>
        </Modal>
      </div>
    );
  },

  getModalBody() {
    this.scrollBodyToTop();

    return (
      <div key={this.props.step}>
        {!this.isCongratulations() &&
        <Remarkable source={this.getStepMarkdown()} options={{'html': true}}/>
        }
        <div className="guide-media">
          {this.renderMedia()}
        </div>
        {this.isCongratulations() &&
        <span className="guide-congratulations">
          <Remarkable source={this.getStepMarkdown()} options={{'html': true}}/>
        </span>
        }
        {this.isNavigationVisible() && this.renderNavigation()}
      </div>
    );
  },

  hasNextStep() {
    return this.props.step + 1 < this.getStepsCount();
  },

  hasPreviousStep() {
    return this.props.step > 0;
  },

  getNextStepRoute() {
    return this.props.lesson.steps[this.props.step + 1].route;
  },

  hasNextStepRoute() {
    return this.props.lesson.steps[this.props.step + 1].hasOwnProperty('route');
  },

  hasPreviousStepRoute() {
    return this.props.lesson.steps[this.props.step - 1].hasOwnProperty('route');
  },

  getPreviousStepRoute() {
    return this.props.lesson.steps[this.props.step - 1].route;
  },

  getActiveStep() {
    return this.props.step;
  },

  getLesson() {
    return this.props.lesson;
  },

  getLessonSteps() {
    return this.getLesson().steps;
  },

  getLessonId() {
    return this.getLesson().id;
  },

  getLessonTitle() {
    return this.getLesson().title;
  },

  getStepsCount() {
    return this.getLessonSteps().length;
  },

  getCurrentStep() {
    return this.getLessonSteps()[this.getActiveStep()];
  },

  getStepId() {
    return this.getLessonSteps()[this.getActiveStep()].id;
  },

  getStepPosition() {
    return this.getLessonSteps()[this.getActiveStep()].position;
  },

  getStepMarkdown() {
    return this.getLessonSteps()[this.getActiveStep()].markdown;
  },

  getStepTitle() {
    return this.getLessonSteps()[this.getActiveStep()].title;
  },

  getStepMedia() {
    return this.getLessonSteps()[this.getActiveStep()].media;
  },

  getStepMediaType() {
    return this.getLessonSteps()[this.getActiveStep()].mediaType;
  },

  getStepRoute() {
    return this.getLessonSteps()[this.getActiveStep()].route;
  },

  isStepBackdrop() {
    return this.getLessonSteps()[this.getActiveStep()].backdrop;
  },

  isCongratulations() {
    return typeof this.getLessonSteps()[this.getActiveStep()].congratulations === 'undefined' ? false : true;
  },

  isNavigationVisible() {
    return this.getLessonSteps()[this.getActiveStep()].isNavigationVisible;
  },

  getModalTitle() {
    return <Modal.Title>{this.getLessonId() + '.' + this.getStepId() + ' ' + this.getStepTitle()}</Modal.Title>;
  },

  getModalTitleExtended() {
    return (
      <div>
        <h2>Lesson {this.getLessonId()}</h2>
        <h1>{this.getLessonTitle()}</h1>
      </div>
    );
  },

  renderMedia() {
    if (this.getStepMediaType() === 'img') {
      return (
        <GuideModeImage
          scriptsBasePath={this.props.scriptsBasePath}
          imageName={this.getStepMedia()}
        />
      );
    }

    return null;
  },

  getStepState(step) {
    let stepState = '';
    if (step.id - 1 < this.props.achievedStep + 1) {
      stepState = 'guide-navigation-step-passed';
    }
    if (this.getActiveStep() === step.id - 1) {
      stepState += ' guide-navigation-step-active';
    }
    return stepState;
  },

  handlePrevStepClick() {
    this.handleStep('prev');
    if (this.hasPreviousStep() && this.hasPreviousStepRoute()) {
      this.handlePrevStepTransition();
    }
  },

  handlePrevStepTransition() {
    const previousStepRoute = this.getPreviousStepRoute();
    let params = {};
    previousStepRoute.params.forEach((param) => {
      const value = RoutesStore.getCurrentRouteParam(param);
      if (value) {
        params[param] = value;
      }
    });
    if (previousStepRoute.params.length === Object.keys(params).length) {
      RoutesStore.getRouter().transitionTo(previousStepRoute.name, params);
    }
  },

  renderButtonPrev() {
    const { step } = this.props.step;
    let buttonText =  <span><i className="fa fa-chevron-left"/> Back</span>;
    if (step === 0) {
      buttonText = 'Close';
    }
    return (
      <Button onClick={this.handlePrevStepClick} bsStyle="link">
        {buttonText}
      </Button>
    );
  },

  handleNextStepClick() {
    this.handleStep('next');
    if (this.hasNextStep() && this.hasNextStepRoute()) {
      this.handleNextStepTransition();
    }
  },

  handleNextStepTransition() {
    const nextStepRoute = this.getNextStepRoute();
    let params = {};
    nextStepRoute.params.forEach((param) => {
      const value = RoutesStore.getCurrentRouteParam(param);
      if (value) {
        params[param] = value;
      }
    });
    if (nextStepRoute.params.length === Object.keys(params).length) {
      RoutesStore.getRouter().transitionTo(nextStepRoute.name, params);
    }
  },

  renderButtonNext() {
    let buttonText =  <span>Next step <i className="fa fa-chevron-right"/></span>;
    if (this.props.step === 0) {
      buttonText = 'Take lesson';
    } else if (this.props.step === this.getStepsCount() - 1) {
      buttonText = 'Close';
    }

    return (
      <Button onClick={this.handleNextStepClick} bsStyle="primary">
        {buttonText}
      </Button>
    );
  },

  renderNavigation() {
    return (
      <ListGroup className="guide-navigation">
        {
          this.getLessonSteps().filter((step) => {
            return step.id <= this.getStepsCount();
          }, this).map((step, index) => {
            if (this.isNavigationVisible() && !step.congratulations) {
              return (
                <ListGroupItem key={index} className={this.getStepState(step) + ' guide-navigation-step'}>
                  <span>
                    {this.getLessonId()}.{step.id}. {step.title}
                  </span>
                </ListGroupItem>
              );
            }
          })}
      </ListGroup>
    );
  },

  renderNextLessonLink() {
    return (
      <Button bsStyle="link" onClick={(e) => {
        e.preventDefault();
        showWizardModalFn(this.getLessonId() + 1);
      }}>
        Lesson {this.getLessonId() + 1}
      </Button>
    );
  },

  closeLessonModal() {
    RoutesStore.getRouter().transitionTo('app');
    hideWizardModalFn();
  },

  handleStep(direction) {
    this.props.setDirection(direction);
    if (direction === 'next') {
      this.increaseStep();
    } else if (direction === 'prev') {
      this.decreaseStep();
    }
  },

  decreaseStep() {
    if (this.props.step > 0) {
      const nextStep = this.props.step - 1;
      this.props.setStep(nextStep);
    } else {
      this.closeLessonModal();
    }
  },

  increaseStep() {
    // try to set achieved lesson on last 2 steps
    if (this.props.step >= this.getStepsCount() - 2) {
      this.props.setAchievedLessonFn(this.getLessonId());
    }

    if (this.props.step < this.getStepsCount() - 1) {
      const nextStep = this.props.step + 1;
      this.props.setStep(nextStep);
    } else {
      this.closeLessonModal();
    }
  },

  scrollBodyToTop() {
    let modalBody = document.getElementsByClassName('guide-modal-body')[0];
    if (typeof modalBody !== 'undefined') {
      modalBody.scrollTop = 0;
    }
  }
});
