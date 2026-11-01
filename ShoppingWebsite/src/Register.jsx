import { Link } from "react-router-dom";
import { useState } from "react";
function Register() {
    const [formData, setFormData] = useState({
        username: "",
        emailId: "",
        age: "",
        password: ""
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:3000/api/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            setMessage(data.message);

        } catch (error) {
    console.log(error);
    setMessage("Unable to connect to server");
}
    };

return (
    <div className="auth-page">
        <div className="auth-container">
            <h2>Register</h2>

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <input
                    type="email"
                    name="emailId"
                    placeholder="Email"
                    value={formData.emailId}
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <input
                    type="number"
                    name="age"
                    placeholder="Age"
                    value={formData.age}
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />

                <br /><br />

                <button type="submit">Register</button>
            </form>

            <p>{message}</p>
            <p>
                Already registered? <Link to="/login">Login</Link>
            </p>
        </div>
        </div>
    );
}

export default Register;
