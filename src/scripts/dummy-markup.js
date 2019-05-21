import React from 'react';
import ReactDOM from 'react-dom';
import OverviewImage from '../images/Login.png';
import * as helpers from './helpers';

const DummyCurrentUser = () => (
  <div style={{ width: '140px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', border: '1px solid #f5f5f5', borderRadius: '5px' }}>
    <div style={{ display: 'inline-block', width: '80px', height: '10px', background: '#f5f5f5', borderRadius: '5px' }} />
    <div style={{ display: 'inline-block', width: '30px', height: '10px', background: '#f5f5f5', borderRadius: '5px' }}/>
  </div>
);

const DummyProjectList = () => (
  <div style={{ marginTop: '115px' }}>
    <div style={{ marginBottom: '32px', height: '32px', background: '#e5e5e5', borderRadius: '5px' }} />
    <div>
      <div style={{ display: 'inline-block', marginBottom: '15px', width: '60%', height: '14px', background: '#efefef', borderRadius: '5px' }} />
    </div>
    <div>
      <div style={{ display: 'inline-block', marginBottom: '15px', width: '40%', height: '16px', background: '#f5f5f5', borderRadius: '5px' }} />
    </div>
    <div>
      <div style={{ display: 'inline-block', marginBottom: '15px', width: '50%', height: '16px', background: '#f5f5f5', borderRadius: '5px' }} />
    </div>
    <div>
      <div style={{ display: 'inline-block', width: '55%', height: '16px', background: '#f5f5f5', borderRadius: '5px' }} />
    </div>
    <hr style={{ borderTop: '1px solid #e3e9f3', margin: '32px 0' }} />
    <div>
      <div style={{ display: 'inline-block', marginBottom: '15px', width: '60%', height: '14px', background: '#efefef', borderRadius: '5px' }} />
    </div>
    <div>
      <div style={{ display: 'inline-block', marginBottom: '15px', width: '40%', height: '16px', background: '#f5f5f5', borderRadius: '5px' }} />
    </div>
    <div>
      <div style={{ display: 'inline-block', marginBottom: '15px', width: '50%', height: '16px', background: '#f5f5f5', borderRadius: '5px' }} />
    </div>
    <div>
      <div style={{ display: 'inline-block', marginBottom: '15px', width: '55%', height: '16px', background: '#f5f5f5', borderRadius: '5px' }} />
    </div>
  </div>
);

const App = () => (
  <div className="container-fluid login-page">
    <div className="row">
      <div className="col-xs-12 col-sm-6 col-md-5 col-lg-4 main">
        <section className="top-content">
          <a href="/admin/projects" className="keboola-logo">
            <span className="kbc-icon-keboola-logo" />
          </a>
          <DummyCurrentUser />
        </section>
        <section>
          <DummyProjectList />
        </section>
        <section className="bottom-content">
          <p>
            Keboola Industries. 2019,{' '}
            <a
              href="https://www.keboola.com/terms-and-conditions"
              target="_blank"
              rel="noopener noreferrer"
            >
              Terms and Conditions
            </a>
          </p>
        </section>
      </div>
      <div className="hidden-xs col-sm-6 col-md-7 col-lg-8 overview">
        <div style={{ position: 'fixed' }}>
          <img src={OverviewImage} className="img-responsive" alt="New dashboard features" />
          <div className="overview-text">
            <h2>New dashboard</h2>
            <p>Important informations always visible to you, no need to look for them.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default {
  loginPage: true,
  start: function() {
    ReactDOM.render(<App />, document.getElementById('react'));
  },
  helpers
};
