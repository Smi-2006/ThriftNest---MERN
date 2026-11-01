import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Products() {
    const [products, setProducts] = useState([]);
    const [message, setMessage] = useState("Loading products...");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                navigate("/login", { replace: true });
                return;
            }

            try {
                const response = await fetch(
                    "http://localhost:3000/api/products",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                const data = await response.json();

                if (response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("username");
                    navigate("/login", { replace: true });
                    return;
                }

                if (response.ok && Array.isArray(data)) {
                    setProducts(data);
                    setMessage(
                        data.length === 0 ? "No products available" : ""
                    );
                } else {
                    setMessage(data.message || "Unable to fetch products");
                }

            } catch (error) {
                console.log(error);
                setMessage("Unable to connect to server");
            }
        };

        fetchProducts();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        navigate("/login", { replace: true });
    };

    return (
        <div>
            <h2>Available Products</h2>

            <p>Welcome, {localStorage.getItem("username")}</p>

            <button onClick={handleLogout}>Logout</button>

            {message && <p>{message}</p>}

            {products.map((product) => (
                <div key={product._id}>
                    <h3>{product.productName}</h3>
                    <p>Product ID: {product.productId}</p>
                    <p>Price: ₹{product.productPrice}</p>
                    <p>Category: {product.category}</p>
                    <p>Quantity: {product.quantity}</p>
                    <p>Description: {product.description}</p>
                    <hr />
                </div>
            ))}
        </div>
    );
}

export default Products;
