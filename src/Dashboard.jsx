// src/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const Dashboard = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rejectionReasons, setRejectionReasons] = useState({}); // Store rejection reason per application
    const [showRejectionInput, setShowRejectionInput] = useState(null); // Track which application is being rejected

    useEffect(() => {
        // Fetch the applications data after the component mounts
        const fetchApplications = async () => {
            const accessToken = localStorage.getItem('accessToken');

            if (!accessToken) {
                setError('Access token not found.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('http://85.198.90.80:8000/api/v1/applications', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch applications');
                }

                const data = await response.json();
                setApplications(data);
            } catch (err) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const handleStatusChange = async (applicationId, newStatus) => {
        const accessToken = localStorage.getItem('accessToken');

        if (!accessToken) {
            setError('Access token not found.');
            return;
        }

        let body = { status: newStatus };

        // If the status is 'rejected', we need to include the rejection reason
        if (newStatus === 'rejected') {
            const rejectionReason = rejectionReasons[applicationId];
            if (!rejectionReason) {
                setError('Rejection reason is required.');
                return;
            }
            body = { status: newStatus, rejection_reason: rejectionReason };
        }

        try {
            const response = await fetch(`http://85.198.90.80:8000/api/v1/applications/${applicationId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                throw new Error('Failed to update application status');
            }

            // Re-fetch applications after status update
            const updatedApplications = applications.map((app) =>
                app.id === applicationId ? { ...app, status: newStatus } : app
            );
            setApplications(updatedApplications);

            setError(''); // Clear any previous errors

        } catch (err) {
            setError(err.message || 'An error occurred while updating the status');
        }
    };

    if (loading) return <p>Loading...</p>;

    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div style={styles.container}>
            <h2>Applications</h2>

            {/* Button to navigate to /categories */}
            <div style={styles.navButtonContainer}>
                <Link to="/categories" style={styles.navButton}>Go to Categories</Link>
            </div>

            {applications.length === 0 ? (
                <p>No applications available.</p>
            ) : (
                <div style={styles.cardContainer}>
                    {applications.map((app) => (
                        <div key={app.id} style={styles.card}>
                            <h3>{app.farm.name}</h3>
                            <p><strong>Farmer:</strong> {`${app.farm.farmer.first_name} ${app.farm.farmer.last_name}`}</p>
                            <p><strong>Status:</strong> {app.status}</p>
                            <p><strong>Address:</strong> {app.farm.address}</p>
                            <p><strong>Crop Types:</strong> {app.farm.crop_types}</p>
                            <p><strong>Size:</strong> {app.farm.size}</p>
                            <p><strong>Verified:</strong> {app.farm.is_verified ? 'Yes' : 'No'}</p>

                            {/* Show action buttons only if status is "pending" */}
                            {app.status === 'pending' && (
                                <div style={styles.buttonsContainer}>
                                    <button
                                        onClick={() => handleStatusChange(app.id, 'approved')}
                                        style={styles.approveButton}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowRejectionInput(app.id);
                                        }}
                                        style={styles.rejectButton}
                                    >
                                        Reject
                                    </button>

                                    {/* Show rejection reason input if rejected */}
                                    {showRejectionInput === app.id && (
                                        <div style={styles.rejectionReasonContainer}>
                                            <input
                                                type="text"
                                                placeholder="Rejection reason"
                                                value={rejectionReasons[app.id] || ''}
                                                onChange={(e) => setRejectionReasons({ ...rejectionReasons, [app.id]: e.target.value })}
                                                style={styles.rejectionInput}
                                            />
                                            <button
                                                onClick={() => handleStatusChange(app.id, 'rejected')}
                                                style={styles.submitButton}
                                            >
                                                Submit Rejection
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
    },
    navButtonContainer: {
        marginBottom: '20px',
    },
    navButton: {
        backgroundColor: '#007bff',
        color: 'white',
        padding: '10px 20px',
        textDecoration: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    cardContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '30px',
    },
    card: {
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '10px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        width: '300px',
        transition: 'box-shadow 0.3s ease',
    },
    cardHover: {
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
    },
    buttonsContainer: {
        marginTop: '10px',
    },
    approveButton: {
        backgroundColor: '#28a745',
        color: '#fff',
        padding: '8px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginRight: '10px',
    },
    rejectButton: {
        backgroundColor: '#dc3545',
        color: '#fff',
        padding: '8px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    rejectionReasonContainer: {
        marginTop: '10px',
    },
    rejectionInput: {
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        width: '100%',
    },
    submitButton: {
        backgroundColor: '#ff6347',
        color: 'white',
        padding: '8px 15px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        marginTop: '10px',
    },
};

export default Dashboard;
