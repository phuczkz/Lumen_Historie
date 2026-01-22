const connection = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
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

// Create a new client with Google auth
exports.createClient = async (req, res) => {
  const { google_id, email, full_name, avatar_url, phone, birth_date, gender } = req.body;

  if (!google_id && !email) {
    return res.status(400).json({ message: 'Google ID or Email are required for a new client' });
  }

  try {
    // Check if client with google_id or email already exists
    const [existingClient] = await connection.promise().query(
      'SELECT id FROM clients WHERE google_id = ? OR email = ?',
      [google_id, email]
    );

    if (existingClient.length > 0) {
      return res.status(400).json({ message: 'Client with this Google ID or Email already exists' });
    }

    // Generate random password
    const randomPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    // Insert new client
    const [result] = await connection.promise().query(
      'INSERT INTO clients (google_id, email, full_name, avatar_url, phone, birth_date, gender, password, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [google_id, email, full_name || null, avatar_url || null, phone || null, birth_date || null, gender || null, hashedPassword, 'active']
    );

    // Send password via email
    const mailOptions = {
      from: 'lumenhistoire@gmail.com',
      to: email,
      subject: 'Your Lumen Histoire Account Password',
      html: `
        <h1>Welcome to Lumen Histoire!</h1>
        <p>Dear ${full_name},</p>
        <p>Your account has been created successfully. Here are your login credentials:</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${randomPassword}</p>
        <p>Please login and change your password for security purposes.</p>
        <p>Best regards,<br>Lumen Histoire Team</p>
      `
    };

    await transporter.sendMail(mailOptions);

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
          message: 'Client created successfully. Password has been sent to your email.',
          token,
          clientId: result.insertId,
          google_id,
          email,
          full_name,
          avatar_url,
          status: 'active'
        });
      }
    );
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Server error while creating client' });
  }
};

// Get all clients
exports.getAllClients = async (req, res) => {
  try {
    const [clients] = await connection.promise().query('SELECT id, google_id, email, full_name, avatar_url, phone, birth_date, gender, status, created_at, updated_at FROM clients ORDER BY created_at DESC');
    res.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error while fetching clients' });
  }
};

// Get a single client by ID
exports.getClientById = async (req, res) => {
  const { id } = req.params;
  try {
    const [clients] = await connection.promise().query(
      'SELECT id, google_id, email, full_name, avatar_url, phone, birth_date, gender, status, created_at, updated_at FROM clients WHERE id = ?',
      [id]
    );
    if (clients.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(clients[0]);
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ message: 'Server error while fetching client' });
  }
};

// Update a client
exports.updateClient = async (req, res) => {
  const { id } = req.params;
  const { email, full_name, avatar_url, phone, birth_date, gender, status } = req.body;

  // google_id is generally not updated once set.
  if (!email && !full_name && avatar_url === undefined && !phone && !birth_date && !gender && !status) {
    return res.status(400).json({ message: 'Nothing to update. Provide email, full_name, avatar_url, phone, birth_date, gender, or status.'});
  }

  try {
    // Check if client exists
    const [clients] = await connection.promise().query('SELECT id, email FROM clients WHERE id = ?', [id]);
    if (clients.length === 0) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // If email is being changed, check if the new email is already taken by another client
    if (email && email !== clients[0].email) {
      const [existingEmail] = await connection.promise().query(
        'SELECT id FROM clients WHERE email = ? AND id != ?',
        [email, id]
      );
      if (existingEmail.length > 0) {
        return res.status(400).json({ message: 'This email is already in use by another client.' });
      }
    }

    let query = 'UPDATE clients SET ';
    const queryParams = [];
    const updatedFields = {};

    if (email) {
      query += 'email = ?, ';
      queryParams.push(email);
      updatedFields.email = email;
    }
    if (full_name !== undefined) {
      query += 'full_name = ?, ';
      queryParams.push(full_name || null);
      updatedFields.full_name = full_name || null;
    }
    if (avatar_url !== undefined) {
      query += 'avatar_url = ?, ';
      queryParams.push(avatar_url || null);
      updatedFields.avatar_url = avatar_url || null;
    }
    if (phone !== undefined) {
      query += 'phone = ?, ';
      queryParams.push(phone || null);
      updatedFields.phone = phone || null;
    }
    if (birth_date !== undefined) {
      query += 'birth_date = ?, ';
      queryParams.push(birth_date || null);
      updatedFields.birth_date = birth_date || null;
    }
    if (gender !== undefined) {
      query += 'gender = ?, ';
      queryParams.push(gender || null);
      updatedFields.gender = gender || null;
    }
    if (status) {
      query += 'status = ?, ';
      queryParams.push(status);
      updatedFields.status = status;
    }

    query += 'updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    queryParams.push(id);

    await connection.promise().query(query, queryParams);

    res.json({ message: 'Client updated successfully', id, ...updatedFields });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Server error while updating client' });
  }
};

// Delete a client
exports.deleteClient = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await connection.promise().query('DELETE FROM clients WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Client not found or already deleted' });
    }
    res.json({ message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Error deleting client:', error);
     if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'Cannot delete client. It is referenced by other records (e.g., orders, reviews).', errorCode: error.code });
    }
    res.status(500).json({ message: 'Server error while deleting client' });
  }
};

// Search clients (by email, full_name, or phone)
exports.searchClients = async (req, res) => {
  const { searchTerm } = req.query;

  if (!searchTerm) {
    return res.status(400).json({ message: 'Please provide a search term' });
  }

  try {
    const query = `SELECT id, google_id, email, full_name, avatar_url, phone, birth_date, gender, status, created_at, updated_at 
                     FROM clients 
                     WHERE email LIKE ? OR full_name LIKE ? OR phone LIKE ?
                     ORDER BY full_name ASC`;
    const likePattern = `%${searchTerm}%`;
    const [clients] = await connection.promise().query(query, [likePattern, likePattern, likePattern]);
    
    if (clients.length === 0) {
        return res.status(404).json({ message: 'No clients found matching your search criteria.' });
    }
    res.json(clients);
  } catch (error) {
    console.error('Error searching clients:', error);
    res.status(500).json({ message: 'Server error while searching clients' });
  }
}; 