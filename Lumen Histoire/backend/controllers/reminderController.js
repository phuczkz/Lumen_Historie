const connection = require('../config/db');

// Create a new reminder
exports.createReminder = async (req, res) => {
  const { client_id, session_id, type, scheduled_send, status } = req.body;

  if (!client_id || !session_id || !type || !scheduled_send) {
    return res.status(400).json({ message: 'Client ID, Session ID, Type, and Scheduled Send time are required.' });
  }
  if (isNaN(new Date(scheduled_send).getTime())) {
    return res.status(400).json({ message: 'Invalid scheduled_send date format.' });
  }

  try {
    // Validate foreign keys exist
    const [client] = await connection.promise().query('SELECT id FROM clients WHERE id = ?', [client_id]);
    if (client.length === 0) return res.status(404).json({ message: `Client with ID ${client_id} not found.` });

    const [session] = await connection.promise().query('SELECT id FROM sessions WHERE id = ?', [session_id]);
    if (session.length === 0) return res.status(404).json({ message: `Session with ID ${session_id} not found.` });

    // Optional: Check if the client_id for the reminder matches the client associated with the session's order
    const [sessionOrderClient] = await connection.promise().query(
        'SELECT o.client_id FROM sessions s JOIN orders o ON s.order_id = o.id WHERE s.id = ?', 
        [session_id]
    );
    if (sessionOrderClient.length > 0 && sessionOrderClient[0].client_id !== parseInt(client_id)) {
        return res.status(400).json({ message: 'Client ID for reminder does not match the client associated with the session.'});
    }

    const reminderData = {
      client_id: parseInt(client_id),
      session_id: parseInt(session_id),
      type,
      scheduled_send: new Date(scheduled_send),
      status: status || 'pending', // Default status
      // sent_at will be null by default, updated when reminder is actually sent
    };

    const [result] = await connection.promise().query('INSERT INTO reminders SET ?', reminderData);
    
    res.status(201).json({
      message: 'Reminder created successfully',
      reminderId: result.insertId,
      ...reminderData
    });

  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ message: 'Server error while creating reminder' });
  }
};

// Get all reminders (can be filtered by client_id or session_id via query params if needed)
exports.getAllReminders = async (req, res) => {
    const { clientId, sessionId } = req.query;
    let query = 'SELECT r.id, r.client_id, r.session_id, r.type, r.scheduled_send, r.sent_at, r.status, r.created_at, ' +
                'c.full_name AS client_name, s.scheduled_at AS session_scheduled_at ' +
                'FROM reminders r ' +
                'JOIN clients c ON r.client_id = c.id ' +
                'JOIN sessions s ON r.session_id = s.id';
    const queryParams = [];

    if (clientId && sessionId) {
        query += ' WHERE r.client_id = ? AND r.session_id = ?';
        queryParams.push(clientId, sessionId);
    } else if (clientId) {
        query += ' WHERE r.client_id = ?';
        queryParams.push(clientId);
    } else if (sessionId) {
        query += ' WHERE r.session_id = ?';
        queryParams.push(sessionId);
    }
    query += ' ORDER BY r.scheduled_send ASC';

    try {
        const [reminders] = await connection.promise().query(query, queryParams);
        res.json(reminders);
    } catch (error) {
        console.error('Error fetching reminders:', error);
        res.status(500).json({ message: 'Server error while fetching reminders' });
    }
};


// Get a single reminder by its ID
exports.getReminderById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'SELECT r.id, r.client_id, r.session_id, r.type, r.scheduled_send, r.sent_at, r.status, r.created_at, ' +
                  'c.full_name AS client_name, s.scheduled_at AS session_scheduled_at ' +
                  'FROM reminders r ' +
                  'JOIN clients c ON r.client_id = c.id ' +
                  'JOIN sessions s ON r.session_id = s.id ' +
                  'WHERE r.id = ?';
    const [reminders] = await connection.promise().query(query, [id]);
    if (reminders.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    res.json(reminders[0]);
  } catch (error) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({ message: 'Server error while fetching reminder' });
  }
};

// Update a reminder
exports.updateReminder = async (req, res) => {
  const { id } = req.params;
  const { type, scheduled_send, status, sent_at } = req.body;

  if (!type && !scheduled_send && !status && sent_at === undefined) {
    return res.status(400).json({ message: 'Nothing to update. Provide type, scheduled_send, status, or sent_at.' });
  }
  if (scheduled_send && isNaN(new Date(scheduled_send).getTime())) {
    return res.status(400).json({ message: 'Invalid scheduled_send date format if provided.' });
  }
  if (sent_at && isNaN(new Date(sent_at).getTime())) {
    return res.status(400).json({ message: 'Invalid sent_at date format if provided.' });
  }

  try {
    const [existingReminders] = await connection.promise().query('SELECT id FROM reminders WHERE id = ?', [id]);
    if (existingReminders.length === 0) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    const fieldsToUpdate = {};
    if (type) fieldsToUpdate.type = type;
    if (scheduled_send) fieldsToUpdate.scheduled_send = new Date(scheduled_send);
    if (status) fieldsToUpdate.status = status;
    if (sent_at !== undefined) fieldsToUpdate.sent_at = sent_at ? new Date(sent_at) : null; // Allow setting to null

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }
    // Reminders table has an auto-updated updated_at field from the schema, no need to set it manually

    await connection.promise().query('UPDATE reminders SET ? WHERE id = ?', [fieldsToUpdate, id]);

    res.json({ message: 'Reminder updated successfully', id, ...fieldsToUpdate });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ message: 'Server error while updating reminder' });
  }
};

// Delete a reminder
exports.deleteReminder = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await connection.promise().query('DELETE FROM reminders WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reminder not found or already deleted' });
    }
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ message: 'Server error while deleting reminder' });
  }
}; 