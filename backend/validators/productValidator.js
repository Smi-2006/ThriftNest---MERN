
const validateProduct = (req, res, next) => {
    const {
        productName,
        description,
        category,
        brand,
        size,
        condition,
        productPrice,
        quantity,
        image
    } = req.body;

    const errors = [];

    // Product name
    if (
        typeof productName !== "string" ||
        productName.trim().length < 3 ||
        productName.trim().length > 100
    ) {
        errors.push("Product name must be 3-100 characters");
    }

    // Description
    if (
        typeof description !== "string" ||
        description.trim().length < 10 ||
        description.trim().length > 1000
    ) {
        errors.push("Description must be 10-1000 characters");
    }

    // Category
    const allowedCategories = [
        "Shirts",
        "Trousers",
        "Dresses",
        "Shoes",
        "Accessories",
        "Other"
    ];

    if (!allowedCategories.includes(category)) {
        errors.push("Invalid product category");
    }

    // Brand
    if (
        brand !== undefined &&
        (
            typeof brand !== "string" ||
            brand.trim().length > 50
        )
    ) {
        errors.push("Brand must not exceed 50 characters");
    }

    // Size
    if (
        typeof size !== "string" ||
        !size.trim() ||
        size.trim().length > 20
    ) {
        errors.push("Enter a valid product size");
    }

    // Condition
    const allowedConditions = [
        "New",
        "Like New",
        "Good",
        "Fair"
    ];

    if (!allowedConditions.includes(condition)) {
        errors.push("Invalid product condition");
    }

    // Price
    const parsedPrice = Number(productPrice);

    if (
        productPrice === undefined ||
        String(productPrice).trim() === "" ||
        !Number.isFinite(parsedPrice) ||
        parsedPrice <= 0
    ) {
        errors.push("Enter a valid positive product price");
    }

    // Quantity
    const parsedQuantity = Number(quantity);

    if (
        quantity === undefined ||
        String(quantity).trim() === "" ||
        !Number.isInteger(parsedQuantity) ||
        parsedQuantity <= 0
    ) {
        errors.push("Quantity must be a positive whole number");
    }

    // Image URL
    if (typeof image !== "string" || !image.trim()) {
        errors.push("Product image URL is required");
    } else {
        try {
            const imageUrl = new URL(image.trim());

            if (
                !["http:", "https:"].includes(imageUrl.protocol) ||
                !imageUrl.hostname ||
                imageUrl.username ||
                imageUrl.password ||
                imageUrl.href.length > 2048
            ) {
                errors.push("Please provide a valid HTTP or HTTPS image URL");
            }
        } catch {
            errors.push("Please provide a valid image URL");
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            message: "Product validation failed",
            errors
        });
    }

    next();
};

module.exports = validateProduct;
