import React from 'react';
import createReactClass from 'create-react-class';
import RegionSelect from './RegionSelect';
import OverviewImage from '../../../images/login.png';

export default createReactClass({
  render() {
    return (
      <div className="container-fluid login-page">
        <div className="row">
          <div className="col-xs-12 col-sm-6 col-md-5 col-lg-4 main">
            <section className="top-content">
              <a href="/admin/projects" className="keboola-logo">
                <span className="kbc-icon-keboola-logo" />
              </a>
              <RegionSelect />
            </section>
            <section>
              <header>
                <h1>Welcome back!</h1>
                <p>Log in to your account</p>
              </header>
              <form className="outer-content" method="post" action="">
                {/* <div className="form-group">
                    <input
                      required
                      id="name"
                      type="text"
                      name="email"
                      value="invalid@email"
                      className="form-control has-error"
                    />
                    <label className="form-control-placeholder" htmlFor="name">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10.7143 0H1.28571C0.575625 0 0 0.575625 0 1.28571V10.7143C0 11.4244 0.575625 12 1.28571 12H10.7143C11.4244 12 12 11.4244 12 10.7143V1.28571C12 0.575625 11.4244 0 10.7143 0ZM5.15111 2.57153H6.84883C7.03322 2.57153 7.17982 2.72635 7.16977 2.91048L6.97108 6.5533C6.96178 6.72376 6.82084 6.85721 6.65014 6.85721H5.34981C5.1791 6.85721 5.03816 6.72376 5.02886 6.5533L4.83017 2.91048C4.82012 2.72635 4.96672 2.57153 5.15111 2.57153ZM4.76788 8.5714C4.76788 9.2519 5.31954 9.80356 6.00005 9.80356C6.68055 9.80356 7.23221 9.2519 7.23221 8.5714C7.23221 7.89089 6.68055 7.33923 6.00005 7.33923C5.31954 7.33923 4.76788 7.89089 4.76788 8.5714Z"
                          fill="#EC001D"
                        />
                      </svg>
                      <span> Looks like its not a valid email address</span>
                    </label>
                  </div> */}
                <div className="form-group">
                  <input required id="email" type="text" name="email" className="form-control" />
                  <label className="form-control-placeholder" htmlFor="email">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.8125 5.4375C11.8125 2.24416 9.23562 0.1875 6 0.1875C2.78766 0.1875 0.1875 2.78716 0.1875 6C0.1875 9.21232 2.78716 11.8125 6 11.8125C7.24045 11.8125 8.45346 11.4122 9.44756 10.68C9.57649 10.585 9.5981 10.4005 9.49666 10.2766L9.13985 9.84073C9.04481 9.72462 8.8762 9.70472 8.75482 9.79289C7.95813 10.3715 6.98995 10.6875 6 10.6875C3.41531 10.6875 1.3125 8.58469 1.3125 6C1.3125 3.41531 3.41531 1.3125 6 1.3125C8.56568 1.3125 10.6875 2.83641 10.6875 5.4375C10.6875 6.91655 9.69192 7.74117 8.74172 7.74117C8.28457 7.74117 8.26985 7.44539 8.35814 7.00376L9.02894 3.52195C9.06237 3.34847 8.92945 3.1875 8.75278 3.1875H7.83462C7.76924 3.18752 7.70592 3.21031 7.65552 3.25195C7.60512 3.29358 7.57079 3.35147 7.55843 3.41566C7.5326 3.5498 7.5195 3.61104 7.50499 3.74362C7.22555 3.28547 6.6641 3.01547 5.97682 3.01547C4.29872 3.01547 2.8125 4.48005 2.8125 6.59836C2.8125 8.03177 3.58305 8.99156 4.99641 8.99156C5.69491 8.99156 6.43416 8.59704 6.86552 8.00159C6.96267 8.72454 7.53342 8.89245 8.25705 8.89245C10.5813 8.89242 11.8125 7.40123 11.8125 5.4375ZM5.39297 7.71914C4.72566 7.71914 4.32727 7.26309 4.32727 6.49922C4.32727 5.15123 5.25445 4.30992 6.07594 4.30992C6.78187 4.30992 7.14166 4.81458 7.14166 5.51883C7.14166 6.6172 6.36408 7.71914 5.39297 7.71914Z"
                        fill="#A2A2A6"
                      />
                    </svg>
                    <span> Login</span>
                  </label>
                </div>
                {/* <div className="form-group">
                    <input required id="name" type="text" name="email" className="form-control" />
                    <label className="form-control-placeholder" htmlFor="name">
                      <svg
                        width="12"
                        height="13"
                        viewBox="0 0 12 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.4 7.71875C7.63125 7.71875 7.26161 8.125 6 8.125C4.73839 8.125 4.37143 7.71875 3.6 7.71875C1.6125 7.71875 0 9.24727 0 11.1312V11.7812C0 12.4541 0.575893 13 1.28571 13H10.7143C11.4241 13 12 12.4541 12 11.7812V11.1312C12 9.24727 10.3875 7.71875 8.4 7.71875ZM10.7143 11.7812H1.28571V11.1312C1.28571 9.92266 2.325 8.9375 3.6 8.9375C3.99107 8.9375 4.62589 9.34375 6 9.34375C7.38482 9.34375 8.00625 8.9375 8.4 8.9375C9.675 8.9375 10.7143 9.92266 10.7143 11.1312V11.7812ZM6 7.3125C8.12946 7.3125 9.85714 5.6748 9.85714 3.65625C9.85714 1.6377 8.12946 0 6 0C3.87054 0 2.14286 1.6377 2.14286 3.65625C2.14286 5.6748 3.87054 7.3125 6 7.3125ZM6 1.21875C7.41696 1.21875 8.57143 2.31309 8.57143 3.65625C8.57143 4.99941 7.41696 6.09375 6 6.09375C4.58304 6.09375 3.42857 4.99941 3.42857 3.65625C3.42857 2.31309 4.58304 1.21875 6 1.21875Z"
                          fill="#A2A2A6"
                        />
                      </svg>

                      <span> Your name</span>
                    </label>
                  </div> */}
                <div className="form-group">
                  <input
                    required
                    id="password"
                    type="password"
                    name="password"
                    className="form-control"
                  />
                  <label className="form-control-placeholder" htmlFor="password">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.5 1.125C9.36396 1.125 10.875 2.63604 10.875 4.5C10.875 6.36396 9.36396 7.875 7.5 7.875C7.05544 7.875 6.63103 7.78887 6.24234 7.63268L5.25 8.625H4.5V9.75H3.375V10.875H1.125V8.625L4.26977 5.48023C4.17354 5.16239 4.12476 4.83209 4.125 4.5C4.125 2.63604 5.63604 1.125 7.5 1.125ZM7.5 0C5.0148 0 3 2.01455 3 4.5C3 4.707 3.01411 4.91304 3.04216 5.11683L0.164742 7.99425C0.0592651 8.09975 7.43515e-06 8.24282 0 8.39201L0 11.4375C0 11.7482 0.251836 12 0.5625 12H3.9375C4.24816 12 4.5 11.7482 4.5 11.4375V10.875H5.0625C5.37316 10.875 5.625 10.6232 5.625 10.3125V9.84375L6.56365 8.90234C6.86967 8.96728 7.18268 9 7.5 9C9.9852 9 12 6.98545 12 4.5C12 2.0148 9.98545 0 7.5 0ZM7.5 3.375C7.5 3.99633 8.00367 4.5 8.625 4.5C9.24633 4.5 9.75 3.99633 9.75 3.375C9.75 2.75367 9.24633 2.25 8.625 2.25C8.00367 2.25 7.5 2.75367 7.5 3.375Z"
                        fill="#A2A2A6"
                      />
                    </svg>
                    <span> Enter Password</span>
                  </label>
                </div>
                {/* <div className="form-group">
                    <input
                      required
                      id="password_confirm"
                      type="password"
                      name="password_confirm"
                      className="form-control"
                    />
                    <label className="form-control-placeholder" htmlFor="password_confirm">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7.5 1.125C9.36396 1.125 10.875 2.63604 10.875 4.5C10.875 6.36396 9.36396 7.875 7.5 7.875C7.05544 7.875 6.63103 7.78887 6.24234 7.63268L5.25 8.625H4.5V9.75H3.375V10.875H1.125V8.625L4.26977 5.48023C4.17354 5.16239 4.12476 4.83209 4.125 4.5C4.125 2.63604 5.63604 1.125 7.5 1.125ZM7.5 0C5.0148 0 3 2.01455 3 4.5C3 4.707 3.01411 4.91304 3.04216 5.11683L0.164742 7.99425C0.0592651 8.09975 7.43515e-06 8.24282 0 8.39201L0 11.4375C0 11.7482 0.251836 12 0.5625 12H3.9375C4.24816 12 4.5 11.7482 4.5 11.4375V10.875H5.0625C5.37316 10.875 5.625 10.6232 5.625 10.3125V9.84375L6.56365 8.90234C6.86967 8.96728 7.18268 9 7.5 9C9.9852 9 12 6.98545 12 4.5C12 2.0148 9.98545 0 7.5 0ZM7.5 3.375C7.5 3.99633 8.00367 4.5 8.625 4.5C9.24633 4.5 9.75 3.99633 9.75 3.375C9.75 2.75367 9.24633 2.25 8.625 2.25C8.00367 2.25 7.5 2.75367 7.5 3.375Z"
                          fill="#A2A2A6"
                        />
                      </svg>
                      <span> Password Confirm</span>
                    </label>
                  </div> */}
                <a href="/admin/auth/lost-password" className="login-link">
                  Forgon Password?
                </a>
                <button
                  name="submit"
                  id="submit"
                  type="submit"
                  className="btn btn-lg btn-info btn-block btn-login"
                >
                  Login
                </button>
                <a
                  href="/admin/auth/oauth/forwardTo/%252Fadmin"
                  className="btn btn-lg btn-info-outline btn-block"
                  rel="nofollow"
                >
                  <svg width="20" height="20" viewBox="0 0 25 25">
                    <g fill="none" fillRule="evenodd">
                      <path
                        d="M20.66 12.693c0-.603-.054-1.182-.155-1.738H12.5v3.287h4.575a3.91 3.91 0 0 1-1.697 2.566v2.133h2.747c1.608-1.48 2.535-3.65 2.535-6.24z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12.5 21c2.295 0 4.22-.76 5.625-2.06l-2.747-2.132c-.76.51-1.734.81-2.878.81-2.214 0-4.088-1.494-4.756-3.503h-2.84v2.202A8.498 8.498 0 0 0 12.5 21z"
                        fill="#34A853"
                      />
                      <path
                        d="M7.744 14.115c-.17-.51-.267-1.055-.267-1.615s.097-1.105.267-1.615V8.683h-2.84A8.488 8.488 0 0 0 4 12.5c0 1.372.328 2.67.904 3.817l2.84-2.202z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12.5 7.38c1.248 0 2.368.43 3.25 1.272l2.437-2.438C16.715 4.842 14.79 4 12.5 4a8.497 8.497 0 0 0-7.596 4.683l2.84 2.202c.668-2.01 2.542-3.504 4.756-3.504z"
                        fill="#EA4335"
                      />
                    </g>
                  </svg>
                  <span>Login with Google</span>
                </a>
              </form>
              <p className="support">
                Having trouble loging in?{' '}
                <a className="login-link" href="mailto:support@keboola.com">
                  Contact support
                </a>
              </p>
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
            <img src={OverviewImage} className="img-responsive" alt="New dashboard features" />
            <div className="overview-text">
              <h2>New dashboard</h2>
              <p>Important informations always visible to you, no need to look for them.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
});
