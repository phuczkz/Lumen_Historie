const connection = require('../config/db');

// Create a new session for an order
exports.createSession = async (req, res) => {
  const { order_id, scheduled_at, notes, status } = req.body;

  if (!order_id || !scheduled_at) {
    return res.status(400).json({ message: 'Order ID and Scheduled At time are required.' });
  }

  try {
    // Validate order_id exists
    const [order] = await connection.promise().query('SELECT id FROM orders WHERE id = ?', [order_id]);
    if (order.length === 0) {
      return res.status(404).json({ message: `Order with ID ${order_id} not found.` });
    }
    
    // Basic validation for scheduled_at (should be a valid date/datetime string)
    if (isNaN(new Date(scheduled_at).getTime())) {
        return res.status(400).json({ message: 'Invalid scheduled_at date format.' });
    }

    const sessionData = {
      order_id: parseInt(order_id),
      scheduled_at: new Date(scheduled_at),
      status: status || 'pending', // Default status
      notes: notes || null,
    };

    const [result] = await connection.promise().query('INSERT INTO sessions SET ?', sessionData);
    
    res.status(201).json({
      message: 'Session created successfully',
      sessionId: result.insertId,
      ...sessionData
    });

  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Server error while creating session' });
  }
};

// Get all sessions for a specific order
exports.getSessionsByOrderId = async (req, res) => {
  const { orderId } = req.params; // Changed from id to orderId for clarity
  try {
    const [sessions] = await connection.promise().query(
        'SELECT s.id, s.order_id, s.scheduled_at, s.status, s.notes, s.created_at, s.updated_at, o.client_id, o.doctor_id ' + 
        'FROM sessions s JOIN orders o ON s.order_id = o.id WHERE s.order_id = ? ORDER BY s.scheduled_at ASC', 
        [orderId]
    );
    if (sessions.length === 0) {
      // It's okay for an order to have no sessions yet, so return empty array not 404
      // unless we want to check if orderId itself is valid first.
      const [order] = await connection.promise().query('SELECT id FROM orders WHERE id = ?', [orderId]);
      if (order.length === 0) return res.status(404).json({ message: `Order with ID ${orderId} not found.` });
    }
    res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions for order:', error);
    res.status(500).json({ message: 'Server error while fetching sessions' });
  }
};

// Get a single session by its ID
exports.getSessionById = async (req, res) => {
  const { id } = req.params;
  try {
    const [sessions] = await connection.promise().query(
        'SELECT s.id, s.order_id, s.scheduled_at, s.status, s.notes, s.created_at, s.updated_at, o.client_id, o.doctor_id ' + 
        'FROM sessions s JOIN orders o ON s.order_id = o.id WHERE s.id = ?', 
        [id]
    );
    if (sessions.length === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(sessions[0]);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Server error while fetching session' });
  }
};

// Update a session
exports.updateSession = async (req, res) => {
  const { id } = req.params;
  const { scheduled_at, status, notes } = req.body;

  if (!scheduled_at && !status && notes === undefined) {
    return res.status(400).json({ message: 'Nothing to update. Provide scheduled_at, status, or notes.' });
  }

  try {
    const [existingSessions] = await connection.promise().query('SELECT id FROM sessions WHERE id = ?', [id]);
    if (existingSessions.length === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }

    const fieldsToUpdate = {};
    if (scheduled_at) {
        if (isNaN(new Date(scheduled_at).getTime())) {
            return res.status(400).json({ message: 'Invalid scheduled_at date format.' });
        }
        fieldsToUpdate.scheduled_at = new Date(scheduled_at);
    }
    if (status) fieldsToUpdate.status = status;
    if (notes !== undefined) fieldsToUpdate.notes = notes === '' ? null : notes; // Allow setting notes to null
    
    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    fieldsToUpdate.updated_at = new Date();

    await connection.promise().query('UPDATE sessions SET ? WHERE id = ?', [fieldsToUpdate, id]);

    res.json({ message: 'Session updated successfully', id, ...fieldsToUpdate });
  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ message: 'Server error while updating session' });
  }
};

// Delete a session
exports.deleteSession = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await connection.promise().query('DELETE FROM sessions WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ message: 'Server error while deleting session' });
  }
};

// Update session status
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ 
      message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
    });
  }

  try {
    // Start a transaction
    const conn = await connection.promise().getConnection();
    await conn.beginTransaction();

    try {
      // Update session status
      const [result] = await conn.query(
        'UPDATE sessions SET status = ?, updated_at = NOW() WHERE id = ?',
        [status, id]
      );

      if (result.affectedRows === 0) {
        await conn.rollback();
        conn.release();
        return res.status(404).json({ message: 'Session not found' });
      }

      // If this is the last session in an order and it's completed/cancelled,
      // update the order status accordingly
      const [sessions] = await conn.query(
        `SELECT s.*, o.number_of_sessions 
         FROM sessions s 
         JOIN orders o ON s.order_id = o.id 
         WHERE s.order_id = (SELECT order_id FROM sessions WHERE id = ?)`,
        [id]
      );

      if (sessions.length > 0) {
        const { order_id, number_of_sessions } = sessions[0];
        const completedCount = sessions.filter(s => s.status === 'completed').length;
        const cancelledCount = sessions.filter(s => s.status === 'cancelled').length;

        let orderStatus = null;
        if (completedCount === number_of_sessions) {
          orderStatus = 'completed';
        } else if (cancelledCount === number_of_sessions) {
          orderStatus = 'cancelled';
        }

        if (orderStatus) {
          await conn.query(
            'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
            [orderStatus, order_id]
          );
        }
      }

      await conn.commit();
      conn.release();

      // Get updated session data
      const [updatedSession] = await connection.promise().query(
        'SELECT s.*, o.client_id, o.doctor_id FROM sessions s JOIN orders o ON s.order_id = o.id WHERE s.id = ?',
        [id]
      );

      res.json({
        message: 'Session status updated successfully',
        ...updatedSession[0]
      });
    } catch (error) {
      await conn.rollback();
      conn.release();
      throw error;
    }
  } catch (error) {
    console.error('Error updating session status:', error);
    res.status(500).json({ message: 'Server error while updating session status' });
  }
};