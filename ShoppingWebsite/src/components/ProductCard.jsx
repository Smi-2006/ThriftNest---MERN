
import { Link } from "react-router-dom";

function ProductCard({ product, addToCart }) {
    return (
        <div className="product-card">

            <Link
                to={`/product/${product.productId}`}
                className="product-link"
            >
                <h3>{product.productName}</h3>

                <p>Price: ₹{product.productPrice}</p>

                <p>Category: {product.category}</p>

                <p>Available Quantity: {product.quantity}</p>

                <p>{product.description}</p>
            </Link>

            <button
                onClick={() => addToCart(product)}
            >
                Add to Cart
            </button>

        </div>
    );
}

export default ProductCard;
