
import { Link } from "react-router-dom";

function Cart({
    cart,
    totalItems,
    increaseQuantity,
    decreaseQuantity
}) {
    const totalPrice = cart.reduce(
        (total, item) =>
            total + item.productPrice * item.quantity,
        0
    );

    return (
        <div className="cart-page">

            <div className="cart-header">

                <h1>Shopping Cart</h1>

                <Link to="/home">
                    <button>Back to Home</button>
                </Link>

            </div>

            <h3>Total Items: {totalItems}</h3>

            {cart.length === 0 ? (
                <h2>Your cart is empty</h2>
            ) : (
                <div>

                    {cart.map((item) => (
                        <div
                            className="cart-item"
                            key={item.productId}
                        >

                            <div>
                                <h3>{item.productName}</h3>

                                <p>
                                    Product ID: {item.productId}
                                </p>

                                <p>
                                    Price: ₹{item.productPrice}
                                </p>

                                <p>
                                    Quantity: {item.quantity}
                                </p>

                                <button
                                    onClick={() =>
                                        decreaseQuantity(item.productId)
                                    }
                                >
                                    -
                                </button>

                                <button
                                    onClick={() =>
                                        increaseQuantity(item.productId)
                                    }
                                >
                                    +
                                </button>
                            </div>

                        </div>
                    ))}

                    <h2>
                        Total Price: ₹{totalPrice.toFixed(2)}
                    </h2>

                </div>
            )}

        </div>
    );
}

export default Cart;
