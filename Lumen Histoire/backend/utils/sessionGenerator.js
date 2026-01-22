const connection = require('../config/db');

/**
 * Generate sessions for an order with specific availability IDs
 * @param {number} orderId - The ID of the order
 * @param {number[]} availabilityIds - Array of doctor_availability IDs
 * @returns {Promise<Array>} Array of created sessions
 */
const generateSessionsForOrder = async (orderId, availabilityIds) => {
  try {
    // Get order details
    const [orders] = await connection.promise().query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );

    if (!orders || orders.length === 0) {
      throw new Error('Order not found');
    }

    const order = orders[0];

    // Create sessions for each availability
    const sessions = [];
    for (const availabilityId of availabilityIds) {
      // Get doctor's availability
      const [availabilities] = await connection.promise().query(
        `SELECT * FROM doctor_availability 
         WHERE id = ? 
         AND doctor_id = ? 
         AND status = 'available'
         AND is_active = 1`,
        [availabilityId, order.doctor_id]
      );

      if (!availabilities || availabilities.length === 0) {
        throw new Error(`No availability found with ID: ${availabilityId}`);
      }

      const availability = availabilities[0];
      console.log('Availability:', availability);

      // Format date to YYYY-MM-DD
      const date = new Date(availability.available_date);
      const formattedDate = date.toISOString().split('T')[0];

      // MySQL TIME type might come as HH:mm:ss or HH:mm
      const time = availability.start_time.length === 5 
        ? availability.start_time + ':00'
        : availability.start_time;

      const scheduled_at = `${formattedDate} ${time}`;
      console.log('Formatted scheduled_at:', scheduled_at);

      const sessionData = {
        order_id: orderId,
        scheduled_at,
        status: 'pending', // Must be one of: pending, confirmed, completed, cancelled
        notes: '',
        created_at: new Date(),
        updated_at: new Date()
      };

      console.log('Session data:', sessionData);

      const [result] = await connection.promise().query(
        'INSERT INTO sessions SET ?',
        sessionData
      );

      // Update doctor's availability to blocked
      await connection.promise().query(
        `UPDATE doctor_availability 
         SET status = 'blocked' 
         WHERE id = ?`,
        [availability.id]
      );

      sessions.push({
        id: result.insertId,
        ...sessionData
      });
    }
    console.log('Sessions:', sessions);
    return sessions;
  } catch (error) {
    console.error('Error generating sessions:', error);
    throw error;
  }
};

module.exports = {
  generateSessionsForOrder
};
