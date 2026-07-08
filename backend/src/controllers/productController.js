const { query } = require('../config/db');

// @desc    Fetch all products (with optional search and category filters)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const { keyword, category } = req.query;
  let sql = 'SELECT * FROM products';
  const params = [];
  const conditions = [];

  if (keyword) {
    conditions.push('(name LIKE ? OR description LIKE ?)');
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (category && category !== 'All') {
    conditions.push('category = ?');
    params.push(category);
  }

  if (conditions.length > 0) {
    sql += ' WHERE ' + conditions.join(' AND ');
  }

  // Sort by newest by default
  sql += ' ORDER BY id DESC';

  try {
    const products = await query.all(sql, params);
    // Parse specs for each product since they are stored as JSON strings
    const formattedProducts = products.map(prod => ({
      ...prod,
      specs: prod.specs ? JSON.parse(prod.specs) : {}
    }));
    res.json(formattedProducts);
  } catch (error) {
    console.error('Fetch products error:', error.message);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await query.get('SELECT * FROM products WHERE id = ?', [id]);
    if (product) {
      product.specs = product.specs ? JSON.parse(product.specs) : {};
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Fetch product by ID error:', error.message);
    res.status(500).json({ message: 'Server error fetching product details' });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { name, description, price, category, stock, image_url, specs } = req.body;

  if (!name || !price || !category || stock === undefined) {
    return res.status(400).json({ message: 'Please provide name, price, category, and stock' });
  }

  try {
    const specsString = specs ? JSON.stringify(specs) : '{}';
    const finalImageUrl = image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=600';

    const result = await query.run(
      'INSERT INTO products (name, description, price, category, stock, image_url, specs) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, Number(price), category, Number(stock), finalImageUrl, specsString]
    );

    const newProduct = await query.get('SELECT * FROM products WHERE id = ?', [result.id]);
    newProduct.specs = JSON.parse(newProduct.specs);

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Create product error:', error.message);
    res.status(500).json({ message: 'Server error creating product' });
  }
};

// @desc    Update a product (Admin only)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, category, stock, image_url, specs } = req.body;

  try {
    const product = await query.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedName = name !== undefined ? name : product.name;
    const updatedDescription = description !== undefined ? description : product.description;
    const updatedPrice = price !== undefined ? Number(price) : product.price;
    const updatedCategory = category !== undefined ? category : product.category;
    const updatedStock = stock !== undefined ? Number(stock) : product.stock;
    const updatedImageUrl = image_url !== undefined ? image_url : product.image_url;
    const updatedSpecs = specs !== undefined ? JSON.stringify(specs) : product.specs;

    await query.run(
      'UPDATE products SET name = ?, description = ?, price = ?, category = ?, stock = ?, image_url = ?, specs = ? WHERE id = ?',
      [updatedName, updatedDescription, updatedPrice, updatedCategory, updatedStock, updatedImageUrl, updatedSpecs, id]
    );

    const updatedProduct = await query.get('SELECT * FROM products WHERE id = ?', [id]);
    updatedProduct.specs = JSON.parse(updatedProduct.specs);

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error.message);
    res.status(500).json({ message: 'Server error updating product' });
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await query.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await query.run('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    console.error('Delete product error:', error.message);
    res.status(500).json({ message: 'Server error deleting product' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
