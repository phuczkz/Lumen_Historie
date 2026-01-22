const connection = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configure nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: '587',
    auth: {
        user: 'h5studiogl@gmail.com',
        pass: 'fScdnZ4WmEDqjBA1',
    },
});

// Register a new admin
exports.registerAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  try {
    // Check if admin already exists
    const [existingAdmin] = await connection.promise().query(
      'SELECT id FROM admins WHERE username = ?',
      [username]
    );

    if (existingAdmin.length > 0) {
      return res.status(400).json({ message: 'Admin with this username already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new admin
    const [result] = await connection.promise().query(
      'INSERT INTO admins (username, password) VALUES (?, ?)',
      [username, hashedPassword]
    );

    res.status(201).json({
      message: 'Admin registered successfully',
      adminId: result.insertId,
    });

  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login an admin
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Please provide username and password' });
  }

  try {
    // Check if admin exists
    const [admins] = await connection.promise().query(
      'SELECT id, username, password FROM admins WHERE username = ?',
      [username]
    );

    if (admins.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const admin = admins[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT
    const payload = {
      admin: {
        id: admin.id,
        username: admin.username
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          message: 'Admin logged in successfully', 
          token,
          adminId: admin.id,
          username: admin.username
        });
      }
    );

  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Register a new client
exports.registerClient = async (req, res) => {
  const { email, full_name, password } = req.body;

  if (!email || !full_name || !password) {
    return res.status(400).json({ message: 'Please provide email, full name and password' });
  }

  try {
    // Check if client already exists
    const [existingClient] = await connection.promise().query(
      'SELECT id FROM clients WHERE email = ?',
      [email]
    );

    if (existingClient.length > 0) {
      return res.status(400).json({ message: 'Client with this email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert new client
    const [result] = await connection.promise().query(
      'INSERT INTO clients (email, full_name, password) VALUES (?, ?, ?)',
      [email, full_name, hashedPassword]
    );

    // Create JWT
    const payload = {
      client: {
        id: result.insertId,
        email: email,
        full_name: full_name
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.status(201).json({
          message: 'Client registered successfully',
          token,
          clientId: result.insertId,
          email: email,
          full_name: full_name
        });
      }
    );

  } catch (error) {
    console.error('Error registering client:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login a client
exports.loginClient = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  try {
    // Check if client exists
    const [clients] = await connection.promise().query(
      'SELECT id, email, full_name, password, avatar_url FROM clients WHERE email = ?',
      [email]
    );

    if (clients.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const client = clients[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, client.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT
    const payload = {
      client: {
        id: client.id,
        email: client.email,
        full_name: client.full_name
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          message: 'Client logged in successfully',
          token,
          clientId: client.id,
          email: client.email,
          full_name: client.full_name,
          avatar_url: client.avatar_url || null
        });
      }
    );

  } catch (error) {
    console.error('Error logging in client:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get admin profile
exports.getAdminProfile = async (req, res) => {
  try {
    const [admin] = await connection.promise().query(
      'SELECT id, username, created_at, updated_at FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (admin.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json(admin[0]);
  } catch (error) {
    console.error('Error getting admin profile:', error);
    res.status(500).json({ message: 'Server error while getting profile' });
  }
};

// Update admin profile
exports.updateAdminProfile = async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  try {
    // Get current admin data
    const [admins] = await connection.promise().query(
      'SELECT id, username, password FROM admins WHERE id = ?',
      [req.admin.id]
    );

    if (admins.length === 0) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    const admin = admins[0];
    let updateFields = [];
    let updateValues = [];

    // Update username if provided
    if (username && username !== admin.username) {
      // Check if username is already taken
      const [existingAdmin] = await connection.promise().query(
        'SELECT id FROM admins WHERE username = ? AND id != ?',
        [username, req.admin.id]
      );

      if (existingAdmin.length > 0) {
        return res.status(400).json({ message: 'Username already exists' });
      }

      updateFields.push('username = ?');
      updateValues.push(username);
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    if (updateFields.length > 0) {
      // Perform update
      await connection.promise().query(
        `UPDATE admins SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...updateValues, req.admin.id]
      );

      res.json({ message: 'Profile updated successfully' });
    } else {
      res.status(400).json({ message: 'No changes provided' });
    }
  } catch (error) {
    console.error('Error updating admin profile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// Get client profile
exports.getClientProfile = async (req, res) => {
  try {
    const [client] = await connection.promise().query(
      "SELECT id, google_id, email, full_name, avatar_url, phone, gender, DATE_FORMAT(birth_date, '%Y-%m-%d') as birth_date, created_at, updated_at, status FROM clients WHERE id = ?",
      [req.client.id]
    );

    if (client.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(client[0]);
  } catch (error) {
    console.error('Error getting client profile:', error);
    res.status(500).json({ message: 'Server error while getting profile' });
  }
};

// Update client profile
exports.updateClientProfile = async (req, res) => {
  const { full_name, phone, currentPassword, newPassword, avatar_url, gender, birth_date } = req.body;

  try {
    // Get current client data
    const [clients] = await connection.promise().query(
      'SELECT id, email, password FROM clients WHERE id = ?',
      [req.client.id]
    );

    if (clients.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    const client = clients[0];
    let updateFields = [];
    let updateValues = [];

    // Update full name if provided
    if (full_name) {
      updateFields.push('full_name = ?');
      updateValues.push(full_name);
    }

    // Update avatar if provided
    if (avatar_url) {
      updateFields.push('avatar_url = ?');
      updateValues.push(avatar_url);
    }
    if(phone){
      updateFields.push('phone = ?');
      updateValues.push(phone);
    }
    if(gender !== undefined){
      updateFields.push('gender = ?');
      updateValues.push(gender);
    }
    if(birth_date !== undefined){
      updateFields.push('birth_date = ?');
      updateValues.push(birth_date);
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, client.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    if (updateFields.length > 0) {
      // Perform update
      await connection.promise().query(
        `UPDATE clients SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [...updateValues, req.client.id]
      );

      res.json({ message: 'Profile updated successfully' });
    } else {
      res.status(400).json({ message: 'No changes provided' });
    }
  } catch (error) {
    console.error('Error updating client profile:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};