const express = require("express");
const app = express();

app.use(express.json());


// Task 4: Error Handling
class NotFoundError extends Error {
    constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
    }
}

class ValidationError extends Error {
    constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
    }
}


// Task 3: Middleware Implementation

// Create a custom logger middleware that logs the request method, URL, and timestamp
app.use((req, res, next) => {
    const time = new Date().toISOString();
    console.log('[${time}] ${req.method} ${req.originalUrl}');
    next();
});

// Add validation middleware for the product creation and update routes
function validateProduct(req, res, next) {
    const { name, description, price, category, inStock } = req.body;
    if (
    typeof name !== 'string' ||
    typeof description !== 'string' ||
    typeof price !== 'number' ||
    typeof category !== 'string' ||
    typeof inStock !== 'boolean'
    ) {
    return res.status(400).json({ error: 'Invalid product data format' });
    }
    next();
}


// Task 1 - Task 1: Express.js Setup
app.get("/", (req, res) => {
    res.send("Hello World");
});


// Task 2 - RESTful API Routes
let products = [
    {
    id: 1,
    name: "Samsung",
    description: "Smartphone",
    price: 50000,
    category: "Nangos",
    inStock: true,
    },

    {
    id: 2,
    name: "Gen Zee Chronicles",
    description: "Literature",
    price: 5000,
    category: "Kioo Cha Jamii",
    inStock: true,
    },

    {
    id: 3,
    name: "Ndula",
    description: "Simbaland",
    price: 1000,
    category: "Footwear",
    inStock: false,
    },
];


// GET /api/products: List all products (with filtering and pagination)
app.get("/api/products", (req, res) => {
    let result = [...products];

    // Filter by category
    if (req.query.category) {
        result = result.filter((p) =>
            p.category.toLowerCase() === req.query.category.toLowerCase()
        );
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || result.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = result.slice(startIndex, endIndex);

    res.json({
        page,
        limit,
        total: result.length,
        data: paginated,
    });
});


// GET /api/products/:id: Get a specific product by ID
app.get("/api/products/:id", (req, res) => {
    const product = products.find((p) => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).send("Product not found");
    res.json(product);
});


// POST /api/products: Create a new product
app.post("/api/products", validateProduct, (req, res) => {
    const newProduct = {
    id: products.length + 1,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    inStock: req.body.inStock,
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});


// PUT /api/products/:id: Update an existing product
app.put("/api/products/:id", validateProduct, (req, res) => {
    const product = products.find((p) => p.id === parseInt(req.params.id));
    if (!product) return res.status(404).send("Product not found");

    product.name = req.body.name;
    product.description = req.body.description;
    product.price = req.body.price;
    product.category = req.body.category;
    product.inStock = req.body.inStock;

    res.json(product);
});


// DELETE /api/products/:id: Delete a product
app.delete("/api/products/:id", (req, res) => {
    const index = products.findIndex((p) => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).send("Product not found");

    const deleted = products.splice(index, 1);
    res.json(deleted[0]);
});


// Task 5: Advanced Features

// GET /api/products/search?name=xxx: Search products by name
app.get("/api/products/search", (req, res) => {
    const searchTerm = req.query.name?.toLowerCase() || '';
    const matches = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm)
    );
    res.json(matches);
});

// GET /api/products/stats: Count of products by category
app.get("/api/products/stats", (req, res) => {
    const stats = {};
    for (const p of products) {
        stats[p.category] = (stats[p.category] || 0) + 1;
    }
    res.json(stats);
});


// Task 4: Error Handling

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.statusCode || 500;
    res.status(status).json({
    error: {
        name: err.name || "Error",
        message: err.message || "Something went wrong",
        statusCode: status,
    },
    });
});


// Server Start
const PORT = 3000;
app.listen(PORT, () => {
    console.log('Server is running on http://localhost:${PORT}');
});