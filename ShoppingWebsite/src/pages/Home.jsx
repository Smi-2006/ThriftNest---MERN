
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";

function Home({ addToCart, cartCount }) {
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

                if (response.status === 401 || response.status === 403) {
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
                    setMessage(data.message || "Unable to load products");
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
        <div className="home">

            {/* Navigation Bar */}
            <div className="navbar">
                <h2>My Online Store</h2>

                <p>
                    Welcome, {localStorage.getItem("username")}
                </p>

                <Link to="/cart">
                    <button>
                        Items Added to Cart: {cartCount}
                    </button>
                </Link>

                <button onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {/* Welcome Banner */}
            <div className="home-banner">
                <h1>Welcome to My Online Store</h1>
                <p>Discover great products at amazing prices.</p>
            </div>

            {/* Products Section */}
            <h1>Our Products</h1>

            {message && <p>{message}</p>}

            <div className="products">
                {products.map((product) => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        addToCart={addToCart}
                    />
                ))}
            </div>

        </div>
    );
}

export default Home;
