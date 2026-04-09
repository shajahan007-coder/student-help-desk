import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, UserCircle } from 'lucide-react';

const API_URL = "https://student-help-desk-api.vercel.app"; 

function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('student'); // Default role
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // --- FIX: This function was missing or outside the component ---
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

            alert(`Welcome aboard! Registered as ${response.data.user.role}`);
            navigate(response.data.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
        } catch (err) {
            console.error("Signup Error:", err);
            setError(err.response?.data?.msg || 'Registration failed. Check backend connection.');
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}
        >
            <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '30px' }}>
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                    <UserPlus size={40} color="#2563eb" />
                    <h2>Create Account</h2>
                    <p style={{ color: '#64748b' }}>Join the Help Desk community</p>
                </div>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* ROLE SELECTOR */}
                    <label style={{ fontWeight: '600', fontSize: '14px' }}>I am a...</label>
                    <div style={{ display: 'flex', gap: '10px', margin: '10px 0 20px' }}>
                        <button 
                            type="button"
                            onClick={() => setRole('student')}
                            style={{ 
                                flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                border: '2px solid', borderColor: role === 'student' ? '#2563eb' : '#e2e8f0',
                                backgroundColor: role === 'student' ? '#eff6ff' : 'white',
                                transition: '0.3s'
                            }}
                        >
                            👨‍🎓 Student
                        </button>
                        <button 
                            type="button"
                            onClick={() => setRole('admin')}
                            style={{ 
                                flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                border: '2px solid', borderColor: role === 'admin' ? '#2563eb' : '#e2e8f0',
                                backgroundColor: role === 'admin' ? '#eff6ff' : 'white',
                                transition: '0.3s'
                            }}
                        >
                            🛡️ Admin
                        </button>
                    </div>

                    <label style={{ fontWeight: '600', fontSize: '14px' }}>Email Address</label>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="name@university.edu" 
                        required 
                        style={{ width: '100%', padding: '10px', margin: '8px 0 15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />

                    <label style={{ fontWeight: '600', fontSize: '14px' }}>Password</label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••" 
                        required 
                        style={{ width: '100%', padding: '10px', margin: '8px 0 20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />

                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                        Register Now
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' }}>
                    Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}>Login</Link>
                </p>
            </div>
        </motion.div>
    );
}

export default Signup;