import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock } from 'lucide-react';

const API_URL = "https://student-help-desk-api.vercel.app"; 

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post(
                `${API_URL}/auth/register`, 
                { email, password, role },
                { withCredentials: true }
            );

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate(response.data.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
        } catch (err) {
            setError(err.response?.data?.msg || 'CORS/Network Error. Check console.');
            console.error("Signup Failed:", err);
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-container">
            <div className="card" style={{ maxWidth: '400px', margin: 'auto', padding: '2rem' }}>
                <div style={{ textAlign: 'center' }}>
                    <UserPlus size={48} color="#2563eb" />
                    <h2>Create Account</h2>
                </div>

                {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
                        <button type="button" onClick={() => setRole('student')} style={{ flex: 1, padding: '10px', background: role === 'student' ? '#2563eb' : '#f1f5f9', color: role === 'student' ? 'white' : 'black', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Student</button>
                        <button type="button" onClick={() => setRole('admin')} style={{ flex: 1, padding: '10px', background: role === 'admin' ? '#2563eb' : '#f1f5f9', color: role === 'admin' ? 'white' : 'black', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Admin</button>
                    </div>

                    <label>Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="email@example.com" style={{ width: '100%', padding: '10px', marginBottom: '15px' }} />

                    <label>Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" style={{ width: '100%', padding: '10px', marginBottom: '20px' }} />

                    <button type="submit" style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Register</button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '15px' }}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </motion.div>
    );
}

export default Signup;