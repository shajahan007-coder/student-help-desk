import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, LogOut, ShieldCheck, Clock, User } from 'lucide-react';

const API_URL = "https://student-help-desk-api.vercel.app";

function AdminDashboard() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("All");
    const token = localStorage.getItem('token');

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

    useEffect(() => { 
        if (!token) {
            window.location.href = '/login';
        } else {
            fetchAdminTickets();
        }
    }, []);

   // Updated FILTER LOGIC with safety checks
const filteredTickets = tickets.filter(ticket => {
    // We use ?. and || "" to ensure we never call toLowerCase on undefined
    const name = ticket.studentName?.toLowerCase() || "";
    const issue = ticket.issue?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    const matchesSearch = name.includes(search) || issue.includes(search);
    const matchesStatus = filterStatus === "All" || ticket.status === filterStatus;
    
    return matchesSearch && matchesStatus;
});

    const handleResolve = async (id) => {
        const remark = prompt("Enter resolution details for the student:");
        if (!remark) return;

        try {
            const res = await axios.put(`${API_URL}/tickets/${id}/resolve`, { remark }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(tickets.map(t => t._id === id ? res.data : t));
            alert("Ticket resolved!");
        } catch (err) {
            alert("Action failed.");
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 20px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                    <ShieldCheck size={36} color="#10b981" /> Admin Control
                </h1>
                <button onClick={handleLogout} style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    Logout
                </button>
            </div>

            {/* SEARCH & FILTER CONTROLS */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
                <input 
                    type="text" 
                    placeholder="Search by student or issue..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ flex: 2, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}
                />
                <select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}
                >
                    <option value="All">All Statuses</option>
                    <option value="Open">Open</option>
                    <option value="Resolved">Resolved</option>
                </select>
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
                <AnimatePresence>
                    {/* CRITICAL CHANGE: We map over filteredTickets, not tickets */}
                    {filteredTickets.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#94a3b8', padding: '20px' }}>No tickets match your search.</p>
                    ) : (
                        filteredTickets.map((ticket) => (
                            <motion.div 
                                key={ticket._id} 
                                layout 
                                initial={{ opacity: 0, y: 10 }} 
                                animate={{ opacity: 1, y: 0 }} 
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="card"
                                style={{ 
                                    background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `6px solid ${ticket.status === 'Open' ? '#f59e0b' : '#10b981'}`
                                }}
                            >
                                <div style={{ textAlign: 'left', flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '8px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                                            <User size={16} /> {ticket.studentName}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94a3b8' }}>
                                            <Clock size={14} /> {new Date(ticket.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '16px', color: '#475569', margin: '0 0 12px 0' }}>{ticket.issue}</p>
                                    <span style={{ 
                                        padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                                        background: ticket.status === 'Open' ? '#fef3c7' : '#d1fae5',
                                        color: ticket.status === 'Open' ? '#92400e' : '#065f46'
                                    }}>
                                        {ticket.status}
                                    </span>
                                    {ticket.adminRemark && (
                                        <p style={{ fontSize: '13px', color: '#059669', marginTop: '10px', fontStyle: 'italic' }}>
                                            <strong>Remark:</strong> {ticket.adminRemark}
                                        </p>
                                    )}
                                </div>
                                
                                {ticket.status === 'Open' && (
                                    <button 
                                        onClick={() => handleResolve(ticket._id)} 
                                        style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}
                                    >
                                        <CheckCircle size={18} /> Resolve
                                    </button>
                                )}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default AdminDashboard;