
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Login() {
    const [emailId, setEmailId] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ emailId, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("username", data.username);
                navigate("/home");
            } else {
                setMessage(data.message);
            }

        } catch (error) {
            console.log(error);
            setMessage("Unable to connect to server");
        }
    };

return (
    <div className="auth-page">
        <div className="auth-container">
            <h2>Login</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={emailId}
                    onChange={(e) => setEmailId(e.target.value)}
                    required
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <br /><br />

                <button type="submit">Login</button>
            </form>

            <p>{message}</p>

            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
        </div>
    );
}

export default Login;
