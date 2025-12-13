import { useState, useEffect } from 'react';
import axios from 'axios';

// IMPORTANT: Setup your API URL. 
// Locally it is http://localhost:3001
// In production, it will be your Vercel backend URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

function App() {
    const [tickets, setTickets] = useState([]);
    const [name, setName] = useState("");
    const [issue, setIssue] = useState("");

    useEffect(() => {
        axios.get(`${API_URL}/tickets`)
            .then(res => setTickets(res.data))
            .catch(err => console.log(err));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`${API_URL}/createTicket`, { studentName: name, issue })
            .then(res => {
                setTickets([...tickets, res.data]);
                setName("");
                setIssue("");
            })
            .catch(err => console.log(err));
    };

    return (
        <div style={{ padding: "20px" }}>
            <h1>Student Help Desk 🎓</h1>

            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    placeholder="Student Name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input 
                    type="text" 
                    placeholder="Describe your issue" 
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                />
                <button type="submit">Submit Ticket</button>
            </form>

            <h2>Recent Tickets</h2>
            <ul>
                {tickets.map(ticket => (
                    <li key={ticket._id}>
                        <strong>{ticket.studentName}</strong>: {ticket.issue} - <em>{ticket.status}</em>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;