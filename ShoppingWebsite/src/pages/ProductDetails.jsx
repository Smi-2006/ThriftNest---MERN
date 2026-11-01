
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";

function ProductDetails() {
    const { id } = useParams();

    const [product, setProduct] = useState(null);
    const [message, setMessage] = useState("Loading...");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
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
                    const selectedProduct = data.find(
                        (item) => item.productId === id
                    );

                    if (selectedProduct) {
                        setProduct(selectedProduct);
                        setMessage("");
                    } else {
                        setMessage("Product not found");
                    }
                } else {
                    setMessage(data.message || "Unable to fetch product");
                }

            } catch (error) {
                console.log(error);
                setMessage("Unable to connect to server");
            }
        };

        fetchProduct();
    }, [id, navigate]);

    if (!product) {
        return <h2 className="loading">{message}</h2>;
    }

    return (
        <div className="details-page">

            <Link to="/home">
                <button>Back to Home</button>
            </Link>

            <div className="details">

                <div className="details-info">

                    <h1>{product.productName}</h1>

                    <p>
                        <strong>Product ID:</strong>{" "}
                        {product.productId}
                    </p>

                    <p>
                        <strong>Category:</strong>{" "}
                        {product.category}
                    </p>

                    <p>
                        <strong>Price:</strong>{" "}
                        ₹{product.productPrice}
                    </p>

                    <p>
                        <strong>Available Quantity:</strong>{" "}
                        {product.quantity}
                    </p>

                    <p>
                        <strong>Description:</strong>{" "}
                        {product.description}
                    </p>

                </div>

            </div>

        </div>
    );
}

export default ProductDetails;
