import { useState, useEffect } from 'react';
import { useNavigate} from 'react-router-dom';
import './generator.css';
import historyBg from './assets/history.webp';

function History() {
    const [emails, setEmails] = useState([]);
    const [keyword, setKeyword] = useState("");
    const [tone, setTone] = useState("");
    const [selectedEmail, setSelectedEmail] = useState(null);
    const navigate = useNavigate();

    useEffect(()=> {
        document.body.style.setProperty("--bg-image",`url(${historyBg})`);
        document.body.classList.add("history-bg");

        return()=> {
            document.body.classList.remove("history-bg");
            document.body.style.removeProperty("--bg-image");
        };
    },[]);

    const loadHistory = async () => {
        try {
            const params = new URLSearchParams();
            if (keyword) params.append("keyword", keyword);
            if (tone && tone !== "All") params.append("tone", tone);

            let url = "http://localhost:5000/history";
            if (params.toString()) url += `?${params.toString()}`;

            const res = await fetch(url, {
                headers: {
                    "Authorization": localStorage.getItem("token") || "",
                },

            });

            if (!res.ok) throw new Error("Failed to fetch history");

            const data = await res.json();
            setEmails(data);
        } catch (err) {
            console.error("Failed to load history: ", err);
        }
    }

    useEffect(() => {
        loadHistory();

    }, []);

    const openModal = (entry) => {
        setSelectedEmail(entry);
    };

    const closeModal = () => {
        setSelectedEmail(null);
    };

    const copyEmail = () => {
        navigator.clipboard.writeText(selectedEmail.emailBody);
        alert("Email copied to clipboard");
    };
    //delete
    const deleteEmail = async (id) => {
        if (!window.confirm("Are you sure you want to delete this email? "))
            return;

        try {
            const response = await fetch(`http://localhost:5000/history/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": localStorage.getItem("token") || "",

                },
            });

            if (response.ok) {
                loadHistory();
            } else {
                alert("Failed to delete");
            }
        } catch (err) {
            alert("Server error");
        }
    };

    return (
        <div className='generator-wrapper'>
            <div className="container">
                <h1>History</h1>
                <p className='welcome'>Your previously generated emails</p>

                <div className='filters'>
                    <input
                        type="text"
                        placeholder='Search here..'
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)} />

                    <select value={tone} onChange={(e) => setTone(e.target.value)}>
                        <option value="">All Tones</option>
                        <option value="Professional">Professional</option>
                        <option value="Friendly">Friendly</option>
                        <option value="Urgent">Urgent</option>
                    </select>

                    <button onClick={loadHistory}>Apply Filters</button>
                </div>

                <div className='history-container'>
                    {emails.length === 0 ? (
                        <p>No history found.</p>
                    ) : (
                        emails.map((entry, index) => (
                            <div className='email-card' key={entry._id}>
                                <p className='date'>📅 {new Date(entry.date).toLocaleString()}</p>
                                <p><strong>Tone:</strong> {entry.tone || "N/A"}</p>
                                <h3>Notes:{entry.notes}</h3>

                                <div className='card-buttons'>
                                    <button className='view-btn' onClick={() => openModal(entry)}>View Full Email</button>
                                    <button className='delete-btn' onClick={() => deleteEmail(entry._id)}>Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className='nav-buttons'>
                    <button className='nav-btn primary' onClick={() => navigate("/generator")}>Back to Generator</button>
                    <button className='nav-btn danger' onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>Logout</button>
                </div>
            </div>

            {selectedEmail && (
                <div className='modal' style={{ display: 'flex' }}>
                    <div className='modal-content'>
                        <span className='close' onClick={closeModal}>&times;</span>
                        <h2>Full Email Draft</h2>
                        <pre id='modalContent'>{selectedEmail.emailBody}</pre>
                        <button onClick={copyEmail}>Copy Email</button>
                    </div>
                </div>
            )}
        </div>
    );
  
}

export default History;

