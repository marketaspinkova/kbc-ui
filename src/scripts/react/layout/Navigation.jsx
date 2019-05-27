import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import { Link } from 'react-router';
import classnames from 'classnames';
import ApplicationStore from '../../stores/ApplicationStore';
import NotificationsAccess from '../common/NotificationsAccess';

export default createReactClass({
  propTypes: {
    notifications: PropTypes.object.isRequired
  },

  render() {
    return (
      <div className="navbar">
        <ul className="nav navbar-nav">
          {this.getPages().map((page) => (
            <li key={page.id}>
              <Link to={page.id} className="navbar-link">
                <span className={classnames('kbc-icon', page.icon)} />
                <span>{page.title}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="navbar-setting">
          {this.renderBin()}
          {this.renderNotifications()}
          {this.renderSetting()}
        </div>
      </div>
    );
  },

  renderBin() {
    return (
      <Link to="settings-trash">
        <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.2857 1.49976H13.9286L13.5089 0.623202C13.42 0.435802 13.2831 0.278165 13.1135 0.168026C12.944 0.0578864 12.7485 -0.000386076 12.5491 -0.000235922H7.44643C7.24749 -0.00103892 7.05236 0.0570163 6.8834 0.167278C6.71443 0.27754 6.57846 0.435549 6.49107 0.623202L6.07143 1.49976H0.714286C0.524845 1.49976 0.343164 1.57878 0.209209 1.71943C0.0752549 1.86009 0 2.05085 0 2.24976L0 3.74976C0 3.94868 0.0752549 4.13944 0.209209 4.28009C0.343164 4.42075 0.524845 4.49976 0.714286 4.49976H19.2857C19.4752 4.49976 19.6568 4.42075 19.7908 4.28009C19.9247 4.13944 20 3.94868 20 3.74976V2.24976C20 2.05085 19.9247 1.86009 19.7908 1.71943C19.6568 1.57878 19.4752 1.49976 19.2857 1.49976ZM2.375 21.8904C2.40907 22.4616 2.64918 22.9977 3.04645 23.3896C3.44373 23.7815 3.9683 23.9997 4.51339 23.9998H15.4866C16.0317 23.9997 16.5563 23.7815 16.9535 23.3896C17.3508 22.9977 17.5909 22.4616 17.625 21.8904L18.5714 5.99976H1.42857L2.375 21.8904Z" fill="#ABABAD"/>
        </svg>
      </Link>
    )
  },

  renderNotifications() {
    if (!this.props.notifications.get('isEnabled')) {
      return null;
    }

    return <NotificationsAccess notifications={this.props.notifications} />;
  },

  renderSetting() {
    return (
      <a href={ApplicationStore.getProjectPageUrl('settings')}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M22.9066 14.8887L20.8243 13.6984C21.0335 12.5756 21.0335 11.4244 20.8243 10.3016L22.9066 9.11135C23.1444 8.97538 23.2548 8.6943 23.1734 8.43465C22.6325 6.71005 21.709 5.15198 20.5012 3.85792C20.315 3.65835 20.0141 3.61307 19.7765 3.74886L17.6958 4.93894C16.8204 4.1961 15.8139 3.61982 14.7271 3.2391V0.859237C14.7271 0.586964 14.5359 0.351658 14.2676 0.291997C12.4735 -0.107147 10.6391 -0.0875021 8.9311 0.292336C8.66325 0.351937 8.47292 0.587471 8.47293 0.859334V3.23915C7.38609 3.61989 6.37963 4.19617 5.50419 4.93899L3.4235 3.74891C3.18587 3.61311 2.88496 3.6584 2.69879 3.85797C1.491 5.15203 0.567529 6.71009 0.026639 8.4347C-0.0548121 8.6944 0.0555647 8.97548 0.293371 9.11139L2.37563 10.3017C2.16648 11.4244 2.16648 12.5756 2.37563 13.6984L0.293322 14.8887C0.0555158 15.0246 -0.0548609 15.3057 0.0265902 15.5653C0.56748 17.29 1.491 18.848 2.69874 20.1421C2.88491 20.3416 3.18582 20.3869 3.42345 20.2511L5.50414 19.0611C6.37956 19.8039 7.38603 20.3802 8.47288 20.7609V23.1408C8.47288 23.413 8.66407 23.6483 8.93232 23.708C10.7265 24.1071 12.5609 24.0875 14.2689 23.7077C14.5367 23.6481 14.727 23.4125 14.727 23.1407V20.7609C15.8139 20.3802 16.8203 19.8039 17.6958 19.0611L19.7765 20.2511C20.0141 20.3869 20.315 20.3416 20.5012 20.1421C21.709 18.848 22.6324 17.29 23.1733 15.5653C23.2548 15.3057 23.1444 15.0246 22.9066 14.8887ZM11.6 8.12904C13.7554 8.12904 15.5089 9.86555 15.5089 12C15.5089 14.1344 13.7554 15.8709 11.6 15.8709C9.44459 15.8709 7.69104 14.1344 7.69104 12C7.69104 9.86555 9.44459 8.12904 11.6 8.12904Z" fill="#ABABAD"/>
        </svg>
      </a>
    )
  },

  getPages() {
    return [
      {
        id: 'home',
        title: 'Dashboard',
        icon: 'kbc-icon-overview'
      },
      {
        id: 'applications',
        title: 'App Store',
        icon: 'kbc-icon-applications'
      },
      {
        id: 'storage-explorer',
        title: 'Storage',
        icon: 'kbc-icon-storage'
      },
      {
        id: 'orchestrations',
        title: 'Orchestrations',
        icon: 'kbc-icon-orchestrations'
      },
      {
        id: 'transformations',
        title: 'Transformations',
        icon: 'kbc-icon-transformations'
      },
      {
        id: 'jobs',
        title: 'Jobs',
        icon: 'kbc-icon-jobs'
      }
    ];
  }
});
