const connection = require('../config/db');

// Create a new review
exports.createReview = async (req, res) => {
  const { appointment_id, client_id, rating, comment } = req.body;

  if (appointment_id === undefined || client_id === undefined || rating === undefined) {
    return res.status(400).json({ message: 'Appointment ID, Client ID, and Rating are required.' });
  }
  if (isNaN(parseInt(rating)) || parseInt(rating) < 1 || parseInt(rating) > 5) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
  }

  try {
    // Validate foreign keys exist
    const [appointment] = await connection.promise().query('SELECT id FROM appointments WHERE id = ?', [appointment_id]);
    if (appointment.length === 0) return res.status(404).json({ message: `Appointment with ID ${appointment_id} not found.` });

    const [client] = await connection.promise().query('SELECT id FROM clients WHERE id = ?', [client_id]);
    if (client.length === 0) return res.status(404).json({ message: `Client with ID ${client_id} not found.` });

    // Check if the client_id in the review matches the client_id associated with the appointment's order
    const [appointmentOrderClient] = await connection.promise().query(
        'SELECT o.client_id FROM appointments a JOIN orders o ON a.order_id = o.id WHERE a.id = ?', 
        [appointment_id]
    );
    if (appointmentOrderClient.length > 0 && appointmentOrderClient[0].client_id !== parseInt(client_id)) {
        return res.status(400).json({ message: 'Client ID for review does not match the client associated with the appointment.'});
    }

    // Check if appointment is completed
    const [appointmentStatus] = await connection.promise().query(
      'SELECT status FROM appointments WHERE id = ?', 
      [appointment_id]
    );
    if (appointmentStatus.length > 0 && appointmentStatus[0].status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed appointments.' });
    }

    const reviewData = {
      appointment_id: parseInt(appointment_id),
      client_id: parseInt(client_id),
      rating: parseInt(rating),
      comment: comment || null,
    };

    const [result] = await connection.promise().query('INSERT INTO reviews SET ?', reviewData);
    
    res.status(201).json({
      message: 'Review created successfully',
      reviewId: result.insertId,
      ...reviewData
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'This client has already reviewed this appointment.' });
    }
    console.error('Error creating review:', error);
    res.status(500).json({ message: 'Server error while creating review' });
  }
};

// Get all reviews for a specific appointment
exports.getReviewsByAppointmentId = async (req, res) => {
  const { appointmentId } = req.params;
  try {
    // Check if appointment exists
    const [appointment] = await connection.promise().query('SELECT id FROM appointments WHERE id = ?', [appointmentId]);
    if (appointment.length === 0) return res.status(404).json({ message: `Appointment with ID ${appointmentId} not found.` });

    const query = `
      SELECT r.id, r.appointment_id, r.rating, r.comment, r.created_at,
             c.id AS client_id, c.full_name AS client_name, c.email AS client_email
      FROM reviews r
      JOIN clients c ON r.client_id = c.id
      WHERE r.appointment_id = ?
      ORDER BY r.created_at DESC
    `;
    const [reviews] = await connection.promise().query(query, [appointmentId]);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews for appointment:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
};

// Get a single review by its ID
exports.getReviewById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT r.id, r.appointment_id, r.rating, r.comment, r.created_at,
             c.id AS client_id, c.full_name AS client_name, c.email AS client_email,
             a.scheduled_at AS appointment_scheduled_at
      FROM reviews r
      JOIN clients c ON r.client_id = c.id
      JOIN appointments a ON r.appointment_id = a.id
      WHERE r.id = ?
    `;
    const [reviews] = await connection.promise().query(query, [id]);
    if (reviews.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }
    res.json(reviews[0]);
  } catch (error) {
    console.error('Error fetching review:', error);
    res.status(500).json({ message: 'Server error while fetching review' });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (rating === undefined && comment === undefined) {
    return res.status(400).json({ message: 'Nothing to update. Provide rating or comment.' });
  }
  if (rating !== undefined && (isNaN(parseInt(rating)) || parseInt(rating) < 1 || parseInt(rating) > 5)) {
    return res.status(400).json({ message: 'Rating must be an integer between 1 and 5 if provided.' });
  }

  try {
    const [existingReviews] = await connection.promise().query('SELECT id, client_id FROM reviews WHERE id = ?', [id]);
    if (existingReviews.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    const fieldsToUpdate = {};
    if (rating !== undefined) fieldsToUpdate.rating = parseInt(rating);
    if (comment !== undefined) fieldsToUpdate.comment = comment === '' ? null : comment;
    
    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    await connection.promise().query('UPDATE reviews SET ? WHERE id = ?', [fieldsToUpdate, id]);

    res.json({ message: 'Review updated successfully', id, ...fieldsToUpdate });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ message: 'Server error while updating review' });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await connection.promise().query('DELETE FROM reviews WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Review not found or already deleted' });
    }
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ message: 'Server error while deleting review' });
  }
};

// Get all reviews with pagination
exports.getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 7;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const expertFilter = req.query.expert || '';
    const serviceFilter = req.query.service || '';

    // Build WHERE clause
    let whereConditions = [];
    let queryParams = [];

    // Search filter
    if (search) {
      whereConditions.push('(c.full_name LIKE ? OR r.comment LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    // Expert filter
    if (expertFilter) {
      whereConditions.push('d.id = ?');
      queryParams.push(expertFilter);
    }

    // Service filter
    if (serviceFilter) {
      whereConditions.push('srv.id = ?');
      queryParams.push(serviceFilter);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as count 
      FROM reviews r
      JOIN clients c ON r.client_id = c.id
      JOIN appointments a ON r.appointment_id = a.id
      JOIN orders o ON a.order_id = o.id
      JOIN services srv ON o.service_id = srv.id
      JOIN doctors d ON o.doctor_id = d.id
      ${whereClause}
    `;
    const [totalCount] = await connection.promise().query(countQuery, queryParams);

    // Get reviews with client and appointment information
    const query = `
      SELECT 
        r.id, r.rating, r.comment, r.created_at,
        c.full_name as customer_name,
        a.scheduled_at as date_time,
        a.session_number,
        srv.id as service_id,
        srv.name as service_name,
        d.id as expert_id,
        d.full_name as expert_name
      FROM reviews r
      JOIN clients c ON r.client_id = c.id
      JOIN appointments a ON r.appointment_id = a.id
      JOIN orders o ON a.order_id = o.id
      JOIN services srv ON o.service_id = srv.id
      JOIN doctors d ON o.doctor_id = d.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const finalParams = [...queryParams, limit, offset];
    const [reviews] = await connection.promise().query(query, finalParams);

    res.json({
      reviews,
      total: totalCount[0].count,
      page,
      totalPages: Math.ceil(totalCount[0].count / limit)
    });
  } catch (error) {
    console.error('Error fetching all reviews:', error);
    res.status(500).json({ message: 'Server error while fetching reviews' });
  }
};

// Get reviews for a specific doctor
exports.getReviewsByDoctorId = async (req, res) => {
  const { doctorId } = req.params;
  try {
    const query = `
      SELECT 
        r.id, r.rating, r.comment, r.created_at,
        c.full_name as client_name,
        a.scheduled_at as appointment_date,
        a.session_number,
        srv.name as service_name
      FROM reviews r
      JOIN clients c ON r.client_id = c.id
      JOIN appointments a ON r.appointment_id = a.id
      JOIN orders o ON a.order_id = o.id
      JOIN services srv ON o.service_id = srv.id
      WHERE o.doctor_id = ?
      ORDER BY r.created_at DESC
    `;
    const [reviews] = await connection.promise().query(query, [doctorId]);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching doctor reviews:', error);
    res.status(500).json({ message: 'Server error while fetching doctor reviews' });
  }
}; 