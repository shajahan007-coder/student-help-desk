import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Send, LogOut, Loader2, MessageSquare, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const API_URL = "https://student-help-desk-api.vercel.app"; 

function StudentDashboard() {
    const [tickets, setTickets] = useState([]);
    const [name, setName] = useState("");
    const [issue, setIssue] = useState("");
    const [priority, setPriority] = useState("Medium"); // New state for priority
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
            // Updated to include priority in the payload
            const res = await axios.post(`${API_URL}/createTicket`, 
                { studentName: name, issue, priority },
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
            setPriority("Medium"); // Reset priority to default
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
        <div className="dashboard-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
            {/* Header Section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <div>
                    <h2 style={{ margin: 0, color: '#1e293b' }}>Student Dashboard</h2>
                    <p style={{ color: '#64748b', margin: 0 }}>Welcome, {userData?.email}</p>
                </div>
                <button onClick={handleLogout} style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                    <LogOut size={18} /> Logout
                </button>
            </div>

            {/* New Ticket Form */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '40px', background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
                    <Send size={20} color="#2563eb" /> New Support Request
                </h3>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 2 }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px' }}>Your Name</label>
                            <input 
                                type="text" placeholder="e.g. Shaha" value={name}
                                onChange={(e) => setName(e.target.value)} required 
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px' }}>Priority Level</label>
                            <select 
                                value={priority} 
                                onChange={(e) => setPriority(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '5px' }}>Issue Details</label>
                        <textarea 
                            placeholder="Describe your technical issue or question..." value={issue}
                            onChange={(e) => setIssue(e.target.value)} required 
                            style={{ width: '100%', minHeight: '100px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                        />
                    </div>
                    <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '16px' }}>
                        Submit Ticket
                    </button>
                </form>
            </motion.div>

            {/* Ticket List Section */}
            <h3 style={{ color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={20} /> Your Ticket History
            </h3>
            
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="animate-spin" size={32} color="#64748b" /></div>
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
                                    style={{ 
                                        padding: '20px', background: '#fff', borderRadius: '12px', boxShadow: '0 2px 4px rgb(0 0 0 / 0.05)',
                                        borderLeft: `6px solid ${ticket.status === 'Open' ? '#f59e0b' : '#10b981'}`,
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase',
                                                    background: ticket.status === 'Open' ? '#fef3c7' : '#d1fae5',
                                                    color: ticket.status === 'Open' ? '#92400e' : '#065f46'
                                                }}>
                                                    {ticket.status}
                                                </span>
                                                
                                                {/* Priority Display */}
                                                <span style={{ fontSize: '11px', fontWeight: '700', color: ticket.priority === 'High' ? '#ef4444' : '#64748b' }}>
                                                    • {ticket.priority} Priority
                                                </span>

                                                <small style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <Clock size={12} /> {new Date(ticket.createdAt).toLocaleDateString()}
                                                </small>
                                            </div>
                                            
                                            <p style={{ margin: '10px 0', fontWeight: '600', fontSize: '1.05rem', color: '#1e293b' }}>{ticket.issue}</p>
                                            
                                            {ticket.adminRemark && (
                                                <div style={{ background: '#f0fdf4', padding: '12px', borderRadius: '8px', marginTop: '10px', border: '1px solid #bbf7d0' }}>
                                                    <p style={{ margin: 0, fontSize: '13px', color: '#166534' }}>
                                                        <strong style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                                            <CheckCircle size={14} /> Admin Response:
                                                        </strong> 
                                                        {ticket.adminRemark}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => handleDelete(ticket._id)}
                                            style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', padding: '5px', transition: 'color 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = '#cbd5e1'}
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