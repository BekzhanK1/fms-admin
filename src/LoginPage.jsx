// src/LoginPage.js
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom'; // To handle the redirection

// Inline styles
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5',  // Soft background color
    },
    form: {
        backgroundColor: '#fff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        width: '100%',
        padding: '12px',
        marginBottom: '20px',
        borderRadius: '5px',
        border: '1px solid #ccc',
        fontSize: '16px',
        transition: 'border-color 0.3s',
    },
    inputFocus: {
        borderColor: '#4CAF50',
    },
    button: {
        width: '100%',
        padding: '14px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        fontSize: '16px',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    },
    errorMessage: {
        color: 'red',
        fontSize: '14px',
        marginBottom: '15px',
    },
};

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [redirectToDashboard, setRedirectToDashboard] = useState(false); // State for redirect

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError(''); // Clear any previous errors

        const credentials = { email, password };

        try {
            // Make API call to authenticate
            const response = await fetch('http://85.198.90.80:8000/api/v1/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            // Check if response is successful (status code 200)
            if (!response.ok) {
                throw new Error('Invalid email or password');
            }

            const data = await response.json();

            // Save access and refresh tokens to localStorage
            const { access, refresh } = data;
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);

            // Make a request to fetch the profile with the access token
            const profileResponse = await fetch('http://85.198.90.80:8000/api/v1/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access}`, // Pass the access token as Bearer token
                },
            });

            if (!profileResponse.ok) {
                throw new Error('Failed to fetch profile');
            }

            const profileData = await profileResponse.json();

            // Check if the role is Admin
            if (profileData.role === 'Admin') {
                setRedirectToDashboard(true); // Redirect to the dashboard
            } else {
                setError('Not allowed');
            }

        } catch (err) {
            // Handle any errors, such as invalid credentials or failed profile fetch
            setError(err.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (redirectToDashboard) {
        // Redirect to dashboard if the role is Admin
        return <Navigate to="/dashboard" />;
    }

    return (
        <div style={styles.container}>
            <div style={styles.form}>
                <h2 style={styles.title}>Login</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                ...styles.input,
                                ...(email ? styles.inputFocus : {}),
                            }}
                            required
                        />
                    </div>
                    <div>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                ...styles.input,
                                ...(password ? styles.inputFocus : {}),
                            }}
                            required
                        />
                    </div>
                    {error && <p style={styles.errorMessage}>{error}</p>}
                    <button
                        type="submit"
                        style={{
                            ...styles.button,
                            ...(loading ? styles.buttonDisabled : {}),
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
