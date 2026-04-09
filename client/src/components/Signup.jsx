import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

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
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true 
                }
            );

            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            navigate(response.data.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
        } catch (err) {
            console.error("Signup Error:", err);
            setError(err.response?.data?.msg || 'CORS Error or Server Offline. Check Console.');
        }
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="signup-wrapper">
             {/* Your existing JSX remains the same */}
             <form onSubmit={handleSubmit}>
                {/* Form Inputs */}
                <button type="submit" className="btn-primary">Register Now</button>
             </form>
        </motion.div>
    );
}

export default Signup;