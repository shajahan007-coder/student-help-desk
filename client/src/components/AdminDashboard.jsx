import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, LogOut, ShieldCheck } from 'lucide-react';

const API_URL = "https://student-help-desk-api.vercel.app";

function AdminDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem('token');

    useEffect(() => { fetchAdminTickets(); }, []);

    const fetchAdminTickets = async () => {
        try {
            const res = await axios.get(`${API_URL}/tickets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data);
            setLoading(false);
        } catch (err) {
            if (err.response?.status === 401) handleLogout();
            setLoading(false);
        }
    };

    const handleResolve = async (id) => {
        const remark = prompt("Enter resolution details for the student:");
        if (!remark) return;

        try {
            const res = await axios.put(`${API_URL}/tickets/${id}/resolve`, { remark }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(tickets.map(t => t._id === id ? res.data : t));
        } catch (err) {
            alert("Action failed. Verification required.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                <h1><ShieldCheck size={30} color="#10b981" /> Admin Control</h1>
                <button onClick={handleLogout} className="btn-logout">Logout</button>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
                <AnimatePresence>
                    {tickets.map((ticket) => (
                        <motion.div key={ticket._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card">
                            <div>
                                <h4>{ticket.studentName}</h4>
                                <p>{ticket.issue}</p>
                                <span className={ticket.status === 'Open' ? 'badge-open' : 'badge-resolved'}>
                                    {ticket.status}
                                </span>
                            </div>
                            {ticket.status === 'Open' && (
                                <button onClick={() => handleResolve(ticket._id)} className="btn-resolve">
                                    <CheckCircle size={18} /> Resolve
                                </button>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default AdminDashboard;