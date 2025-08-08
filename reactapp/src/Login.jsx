import { useState } from 'react';
import apiClient from './apiClient';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const LoginPage = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!username || !password) {
            setErrorMessage('Username and password are required.');
            return;
        }

        setLoading(true);
        const dataObj = {
            username: username,
            password: password
        };

        try {
            await apiClient.post('/api/Login', dataObj, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                withCredentials: true  // Enable this if you need to include cookies in the request
            });

            // Login was successful, update parent state and redirect
            onLogin();  // Call the onLogin function from parent component to update the state
            localStorage.setItem('isAuthenticated', 'true'); // Store authentication status in localStorage
            navigate('/data');  // Redirect to /data page after login

        } catch (error) {
            if (error.response.statusText == "Unauthorized") {
                setErrorMessage(error.response.data.message);
            } else if (error.request) {
                setErrorMessage('Network error: Please try again later.');
            } else {
                setErrorMessage('Request error: ' + error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleLogin} style={styles.form}>
                <h2>Login</h2>
                <div style={styles.inputGroup}>
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={styles.input}
                    />
                </div>
                <div style={styles.inputGroup}>
                    <label htmlFor="password">Password</label>
                    <div style={styles.passwordContainer}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                </div>
                {errorMessage && <p style={styles.error}>{errorMessage}</p>}
                <button type="submit" style={styles.button} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '20px',
        textAlign: 'center',
    },
    error: {
        color: 'red'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '200px'
    },
    inputGroup: {
        marginBottom: '15px',
    },
    input: {
        padding: '10px',
        fontSize: '16px',
        width: '100%',
        marginTop: '5px',
        borderRadius: '5px',
        border: '1px solid #ccc',
    },
    button: {
        marginTop: '5px',
        padding: '10px 20px',
        fontSize: '16px',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        width: '100%',
        marginLeft: '2.5px'
    },
};

export default LoginPage;
