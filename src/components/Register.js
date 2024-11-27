import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Ensure the CSS file is imported

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isApp, setIsApp] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();  // Correct hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { username, password, isApp });
      
      // Call login with the token (and userId if needed)
      login(res.data.userId, res.data.token);
      
      // Navigate to the dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error(err.response?.data || 'Server error');
      // Handle error (e.g., show error message to user)
    }
  };

  return (
    <div className="centered-box">  {/* Add the centered-box class */}
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <label>
          <input 
            type="checkbox" 
            checked={isApp} 
            onChange={(e) => setIsApp(e.target.checked)} 
          />
          Register as App
          
        </label>
        <br></br>
        <button type="submit" className="btn-3d">Register</button> {/* Add the 3D button class */}
      </form>
      <p>
        Already have an account? <a href="/login">Login</a>
      </p>
    </div>
  );
};

export default Register;
