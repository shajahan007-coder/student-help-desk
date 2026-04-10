import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Send, LogOut, Loader2, Calendar, MessageSquare } from 'lucide-react';

const API_URL = "https://student-help-desk-api.vercel.app"; 

function StudentDashboard() {
    const [tickets, setTickets] = useState([]);
    const [name, setName] = useState("");
    const [issue, setIssue] = useState("");
    const [loading, setLoading] = useState(true);
    
    const token = localStorage.getItem('token');
    const userData = JSON.parse(localStorage.getItem('user') || '{}');

    const fetchTickets = async () => {
        if (!token) return;
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/tickets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data);
        } catch (err) {
            console.error("Fetch Error:", err.response?.data);
            if (err.response?.status === 401) handleLogout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!token) {
            window.location.href = '/login';
        } else {
            fetchTickets();
        }
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/createTicket`, 
                { studentName: name, issue },
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );
            setTickets([res.data, ...tickets]); 
            setName("");
            setIssue("");
            alert("Ticket created successfully!");
        } catch (err) {
            alert(`Error: ${err.response?.data?.msg || "Failed to submit"}`);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this request?")) return;
        try {
            await axios.delete(`${API_URL}/tickets/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(tickets.filter(t => t._id !== id));
        } catch (err) {
            alert("Delete failed.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div className="dashboard-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ margin: 0 }}>Student Dashboard</h2>
                    <p style={{ color: '#64748b', margin: 0 }}>Welcome, {userData?.email}</p>
                </div>
                <button onClick={handleLogout} className="btn-primary" style={{ backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <LogOut size={18} /> Logout
                </button>
            </div>

            {/* New Ticket Form */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: '40px' }}>
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Send size={20} color="#2563eb" /> New Support Request
                </h3>
                <form onSubmit={handleSubmit}>
                    <label style={{ fontSize: '14px', fontWeight: '600' }}>Your Name</label>
                    <input 
                        type="text" placeholder="e.g. Shajahan" value={name}
                        onChange={(e) => setName(e.target.value)} required 
                    />
                    <label style={{ fontSize: '14px', fontWeight: '600' }}>Issue Details</label>
                    <textarea 
                        placeholder="Describe your technical issue or question..." value={issue}
                        onChange={(e) => setIssue(e.target.value)} required 
                        style={{ minHeight: '100px' }}
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Submit Ticket</button>
                </form>
            </motion.div>

            {/* Ticket List Section */}
            <h3><MessageSquare size={20} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Your Ticket History</h3>
            
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin" size={32} /></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <AnimatePresence>
                        {tickets.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '20px' }}>No tickets submitted yet.</p>
                        ) : (
                            tickets.map(ticket => (
                                <motion.div 
                                    key={ticket._id}
                                    layout
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="card"
                                    style={{ 
                                        borderLeft: `6px solid ${ticket.status === 'Open' ? '#f59e0b' : '#10b981'}`,
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                                <span className={`badge ${ticket.status === 'Open' ? 'badge-open' : 'badge-resolved'}`}>
                                                    {ticket.status}
                                                </span>
                                                <small style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    // In your ticket display component
                                                    <p>Submitted on: {new Date(ticket.createdAt).toLocaleDateString()}</p>
                                                    {/* <Calendar size={12} /> {new Date(ticket.date).toLocaleDateString()} */}
                                                </small>
                                            </div>
                                            
                                            <p style={{ margin: '10px 0', fontWeight: '600', fontSize: '1.1rem' }}>{ticket.issue}</p>
                                            
                                            {/* Admin Remark Section - Upgraded! */}
                                            {ticket.status === 'Resolved' && ticket.adminRemark && (
                                                <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', marginTop: '10px', border: '1px solid #bbf7d0' }}>
                                                    <p style={{ margin: 0, fontSize: '13px', color: '#166534' }}>
                                                        <strong style={{ display: 'block', marginBottom: '4px' }}>✅ Admin Response:</strong> 
                                                        {ticket.adminRemark}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => handleDelete(ticket._id)}
                                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}
                                            title="Delete Ticket"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}

export default StudentDashboard;