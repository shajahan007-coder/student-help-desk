import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserCircle, Mail, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

function Signup() {
    const [role, setRole] = useState('student');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="auth-card">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <UserCircle size={48} color="#2563eb" />
                <h2>Create Account</h2>
            </div>

            <form onSubmit={handleSubmit}>
                {/* ROLE SELECTOR */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>I am a:</label>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                            type="button"
                            onClick={() => setRole('student')}
                            style={{ 
                                flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                border: '2px solid', borderColor: role === 'student' ? '#2563eb' : '#e2e8f0',
                                backgroundColor: role === 'student' ? '#eff6ff' : 'white'
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
                                backgroundColor: role === 'admin' ? '#eff6ff' : 'white'
                            }}
                        >
                            🛡️ Admin
                        </button>
                    </div>
                </div>

                {/* EMAIL */}
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
                    <div style={{ position: 'relative' }}>
                        <Mail style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} size={18} />
                        <input 
                            type="email" 
                            placeholder="name@university.edu" 
                            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                {/* PASSWORD */}
                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', top: '12px', left: '12px', color: '#94a3b8' }} size={18} />
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            style={{ width: '100%', padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <button type="submit" className="btn-primary" style={{ width: '100%' }}>Register Now</button>
            </form>

            <p style={{ marginTop: '20px', textAlign: 'center', color: '#64748b' }}>
                Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold' }}>Login</Link>
            </p>
        </motion.div>
    );
}

export default Signup;