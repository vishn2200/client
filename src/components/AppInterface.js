import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';

const AppInterface = () => {
  const [app, setApp] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [error, setError] = useState('');
  const { appId } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    const fetchAppAndWallet = async () => {
      try {
        const appRes = await axios.get(`http://localhost:5000/api/apps/${appId}`, {
          headers: { 'x-auth-token': user.token }
        });
        setApp(appRes.data);

        const walletRes = await axios.get(`http://localhost:5000/api/wallet/${user._id}/${appId}`, {
          headers: { 'x-auth-token': user.token }
        });
        setWallet(walletRes.data);
      } catch (err) {
        console.error(err.response?.data || 'Error fetching app or wallet');
      }
    };

    fetchAppAndWallet();
  }, [appId, user]);

  const handleInteraction = async () => {
    try {
      setError('');
      const res = await axios.post(
        'http://localhost:5000/api/apps/earn-tokens',
        { userId: user._id, appId: appId, action: 'click' },
        { headers: { 'x-auth-token': user.token } }
      );

      setWallet(prevWallet => ({
        ...prevWallet,
        tokenBalance: prevWallet.tokenBalance + res.data.tokensAwarded
      }));
      setApp(prevApp => ({
        ...prevApp,
        tokenBalance: res.data.appTokenBalance
      }));
    } catch (err) {
      const errorMessage = err.response?.data?.msg || 'Error interacting with app';
      setError(errorMessage);
      console.error(errorMessage);
    }
  };

  if (!app || !wallet) return <div className="loading">Loading...</div>;

  return (
    <div className="app-interface-container centered-box">
      <h2 className="app-title">{app.username}</h2>
      <div className="token-info">
        <p><strong>App's available tokens:</strong> {app.tokenBalance}</p>
        <p><strong>Your token balance:</strong> {wallet.tokenBalance}</p>
      </div>
      {error && <p className="error-message">{error}</p>}
      <button onClick={handleInteraction} className="btn-3d">Click to earn tokens</button>
    </div>
  );
};

export default AppInterface;
