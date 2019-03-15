import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import { Button } from 'react-bootstrap';

export default createReactClass({

  propTypes: {
    lessons: PropTypes.object.isRequired,
    achievedLessonId: PropTypes.number.isRequired,
    openLessonModalFn: PropTypes.func.isRequired
  },

  render() {
    return (
      <div className="kbc-overview-component">
        <div className="guide-desk-container">
          <div className="guide-desk">
            <h2>Welcome to Keboola Connection</h2>
            <h1>Guide Mode</h1>
            <div className="row">
              <div className="col-xs-4">
                <ul>
                  {this.renderLessonList()}
                </ul>
              </div>
              <div className="col-xs-5">
                <p>
                  Learn all you need to know about Keboola Connection &ndash; our powerful and safe environment for working with data.
                  <br/>
                  <br/>
                  These lessons will walk you through the basic steps of creating a project: from loading and manipulating data to visualizing the results and automating the whole process.
                  <br/>
                  <br/>
                  Do you enjoy working with Keboola Connection? Please contact us to create a new production project.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderLessonList() {
    const { lessons, achievedLessonId, openLessonModalFn } = this.props;
    return Object.keys(lessons).map((lesson, key) => {
      return (
        <li key={key}>
          <Button
            bsStyle="link" className={'guide-lesson-link' + (achievedLessonId < key ? ' guide-lesson-link-locked' : '')}
            onClick={(e) => {
              e.preventDefault();
              openLessonModalFn(key + 1);
            }}
          >
            Lesson {key + 1} - {lessons[key + 1].title}
          </Button>
          {achievedLessonId < key && <i className="guide-lock fa fa-lock"/>}
        </li>
      );
    });
  }
});
