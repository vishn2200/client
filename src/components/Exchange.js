import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../App.css';
import io from 'socket.io-client';

const socket = io('http://localhost:5000', { transports: ['websocket'] });

const Exchange = () => {
  const { appId } = useParams();
  const { user } = useAuth();
  const [orderBook, setOrderBook] = useState({ buyOrders: [], sellOrders: [] });
  const [currentPrice, setCurrentPrice] = useState(null);
  const [buyAmount, setBuyAmount] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    fetchOrderBook();
    fetchWalletBalance();

    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
    });

    socket.on('priceUpdate', ({ appId: updatedAppId, price }) => {
      if (updatedAppId === appId) {
        setCurrentPrice(price);
      }
    });

    return () => socket.off('priceUpdate');
  }, [appId, user]);

  const fetchOrderBook = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/exchange/orderbook/${appId}`, {
        headers: { 'x-auth-token': user.token }
      });
      setOrderBook(res.data);
    } catch (err) {
      console.error(err.response.data);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/wallet/${appId}`, {
        headers: { 'x-auth-token': user.token }
      });
      setWalletBalance(res.data.tokenBalance);
    } catch (err) {
      console.error(err.response.data);
    }
  };

  const handleBuyOrder = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/exchange/buy',
        { userId: user.id, appId, tokenAmount: buyAmount, pricePerTokenInINR: buyPrice },
        { headers: { 'x-auth-token': user.token } }
      );
      fetchOrderBook();
      fetchWalletBalance();
      setBuyAmount('');
      setBuyPrice('');
    } catch (err) {
      console.error(err.response.data);
    }
  };

  const handleSellOrder = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/exchange/sell',
        { userId: user.id, appId, tokenAmount: sellAmount, pricePerTokenInINR: sellPrice },
        { headers: { 'x-auth-token': user.token } }
      );
      fetchOrderBook();
      fetchWalletBalance();
      setSellAmount('');
      setSellPrice('');
    } catch (err) {
      console.error(err.response.data);
    }
  };

  return (
    <div>
      <h2>Exchange for App {appId}</h2>
      <p>Current Price: {currentPrice ? `₹${currentPrice}` : 'Loading...'}</p>
      <p>Wallet Balance: {walletBalance} tokens</p>
      
      {/* Buy Order Form */}
      <div className="order-form">
        <h3>Place Buy Order</h3>
        <input
          type="number"
          value={buyAmount}
          onChange={(e) => setBuyAmount(e.target.value)}
          placeholder="Token Amount"
        />
        <input
          type="number"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
          placeholder="Price per Token in INR"
        />
        <button onClick={handleBuyOrder}>Buy Tokens</button>
      </div>

      {/* Sell Order Form */}
      <div className="order-form">
        <h3>Place Sell Order</h3>
        <input
          type="number"
          value={sellAmount}
          onChange={(e) => setSellAmount(e.target.value)}
          placeholder="Token Amount"
        />
        <input
          type="number"
          value={sellPrice}
          onChange={(e) => setSellPrice(e.target.value)}
          placeholder="Price per Token in INR"
        />
        <button onClick={handleSellOrder}>Sell Tokens</button>
      </div>

      <div>
        <h3>Buy Orders</h3>
        <ul>
          {orderBook.buyOrders.map((order, index) => (
            <li key={index}>
              Amount: {order.tokenAmount}, Price: {order.pricePerTokenInINR}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3>Sell Orders</h3>
        <ul>
          {orderBook.sellOrders.map((order, index) => (
            <li key={index}>
              Amount: {order.tokenAmount}, Price: {order.pricePerTokenInINR}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Exchange;
