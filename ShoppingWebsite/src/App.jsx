
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";

import Register from "./Register";
import Login from "./Login";
import Products from "./Product";

function App() {
  const [cart, setCart] = useState([]);

  // Add product to cart
  const addToCart = (product) => {
    const existingProduct = cart.find(
      (item) => item.productId === product.productId
    );

    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Increase product quantity
  const increaseQuantity = (productId) => {
    setCart(
      cart.map((item) =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Decrease product quantity
  const decreaseQuantity = (productId) => {
    setCart(
      cart
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Calculate total cart items
  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <BrowserRouter>
      <Routes>

        {/* Login and Registration */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* MongoDB Products */}
        <Route path="/products" element={<Products />} />

        {/* Shopping Homepage */}
        <Route
          path="/home"
          element={
            <Home
              addToCart={addToCart}
              cartCount={totalItems}
            />
          }
        />

        {/* Product Details */}
        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        {/* Shopping Cart */}
        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              totalItems={totalItems}
              increaseQuantity={increaseQuantity}
              decreaseQuantity={decreaseQuantity}
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
