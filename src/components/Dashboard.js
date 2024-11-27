import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [app, setApp] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/apps/single-app', {
          headers: { 'x-auth-token': user.token },
        });
        setApp(res.data);
      } catch (err) {
        console.error(err.response?.data || 'Error fetching app');
      }
    };

    if (user) {
      fetchApp();
    }
  }, [user]);

  const handleAppClick = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/apps/earn-tokens',
        { userId: user._id, appId: app._id, action: 'click' },
        { headers: { 'x-auth-token': user.token } }
      );
      navigate(`/app/${app._id}`);
    } catch (err) {
      console.error(err.response?.data || 'Error interacting with app');
    }
  };

  return (
    <div>
      {/* Header Section */}
      <header className="dashboard-header">
        <h1 className="dashboard-title">Santoshi</h1>
        <button onClick={logout} className="logout-btn">Logout</button>
      </header>

      {/* Main Content */}
      <div className="dashboard-container">
        <h3>Your Apps</h3>
        {app ? (
          <div className="app-info-container">
            <p className="app-info">App: {app.username}</p>
            <div className="button-group">
              <button onClick={handleAppClick} className="btn-3d">Go to {app.username}</button>
              <Link to={`/exchange/${app._id}`}>
                <button className="btn-3d">Go to Exchange</button>
              </Link>
            </div>
          </div>
        ) : (
          <p>Loading app...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
