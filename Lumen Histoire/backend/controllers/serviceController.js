const connection = require('../config/db');

// Create a new service
exports.createService = async (req, res) => {
  const { name, description, price, number_of_sessions, article_content, image, doctor_ids } = req.body;
  console.log(req.body);
  if (!name || price === undefined || number_of_sessions === undefined) {
    return res.status(400).json({ message: 'Service name, price, and number of sessions are required' });
  }
  if (isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    return res.status(400).json({ message: 'Price must be a valid non-negative number' });
  }
  if (isNaN(parseInt(number_of_sessions)) || parseInt(number_of_sessions) <= 0) {
    return res.status(400).json({ message: 'Number of sessions must be a valid positive integer' });
  }

  const pool = connection.promise();
  let conn;
  try {
    conn = await pool.getConnection();
    
    // Start a transaction
    await conn.beginTransaction();

    // Insert the service
    const [result] = await conn.query(
      'INSERT INTO services (name, description, price, number_of_sessions, article_content, image) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || null, parseFloat(price), parseInt(number_of_sessions), article_content || null, image || null]
    );

    const serviceId = result.insertId;

    // If expert_ids are provided and valid, insert them into service_doctors table
    if (doctor_ids && Array.isArray(doctor_ids) && doctor_ids.length > 0 && !doctor_ids.includes(null)) {
      const values = doctor_ids.map(expertId => [serviceId, expertId]);
      await conn.query(
        'INSERT INTO service_doctors (service_id, doctor_id) VALUES ?',
        [values]
      );
    }

    // Commit the transaction
    await conn.commit();

    // Get the assigned doctors for response
    const [doctors] = await conn.query(
      `SELECT d.id, d.full_name 
       FROM doctors d 
       JOIN service_doctors sd ON d.id = sd.doctor_id 
       WHERE sd.service_id = ?`,
      [serviceId]
    );

    res.status(201).json({
      message: 'Service created successfully',
      serviceId: serviceId,
      name,
      description: description || null,
      price: parseFloat(price),
      number_of_sessions: parseInt(number_of_sessions),
      article_content: article_content || null,
      image: image || null,
      doctors: doctors
    });
  } catch (error) {
    if (conn) {
      await conn.rollback();
    }
    console.error('Error creating service:', error);
    res.status(500).json({ message: 'Server error while creating service' });
  } finally {
    if (conn) {
      conn.release();
    }
  }
};

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const [services] = await connection.promise().query(
      `SELECT s.*, 
              GROUP_CONCAT(DISTINCT d.id) as doctor_ids,
              GROUP_CONCAT(DISTINCT d.full_name) as doctor_names,
              GROUP_CONCAT(DISTINCT CONCAT(d.id, ':', d.full_name, ':', COALESCE(d.specialty, ''))) as doctor_details
       FROM services s
       LEFT JOIN service_doctors sd ON s.id = sd.service_id
       LEFT JOIN doctors d ON sd.doctor_id = d.id
       GROUP BY s.id
       ORDER BY s.name ASC`
    );

    // Format the response
    const formattedServices = services.map(service => ({
      ...service,
      doctor_ids: service.doctor_ids ? service.doctor_ids.split(',').map(id => parseInt(id)) : [],
      doctor_names: service.doctor_names ? service.doctor_names.split(',') : [],
      doctor_details: service.doctor_details 
        ? service.doctor_details.split(',').map(detail => {
            const [id, name, specialty] = detail.split(':');
            return {
              id: parseInt(id),
              name,
              specialty
            };
          })
        : []
    }));

    res.json(formattedServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ message: 'Server error while fetching services' });
  }
};

// Get a single service by ID
exports.getServiceById = async (req, res) => {
  const { id } = req.params;
  try {
    // Get service details
    const [services] = await connection.promise().query(
      `SELECT s.*, 
              GROUP_CONCAT(DISTINCT d.id) as doctor_ids,
              GROUP_CONCAT(DISTINCT d.full_name) as doctor_names,
              GROUP_CONCAT(DISTINCT CONCAT(d.id, ':', d.full_name, ':', COALESCE(d.specialty, ''))) as doctor_details
       FROM services s
       LEFT JOIN service_doctors sd ON s.id = sd.service_id
       LEFT JOIN doctors d ON sd.doctor_id = d.id
       WHERE s.id = ?
       GROUP BY s.id`,
      [id]
    );

    if (services.length === 0) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Format the response
    const service = {
      ...services[0],
      doctor_ids: services[0].doctor_ids ? services[0].doctor_ids.split(',').map(id => parseInt(id)) : [],
      doctor_names: services[0].doctor_names ? services[0].doctor_names.split(',') : [],
      doctor_details: services[0].doctor_details 
        ? services[0].doctor_details.split(',').map(detail => {
            const [id, name, specialty] = detail.split(':');
            return {
              id: parseInt(id),
              name,
              specialty
            };
          })
        : []
    };

    res.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ message: 'Server error while fetching service' });
  }
};

// Update a service
exports.updateService = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, number_of_sessions, article_content, image, doctor_ids } = req.body;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: 'Nothing to update. Provide at least one field.' });
  }

  if (price !== undefined && (isNaN(parseFloat(price)) || parseFloat(price) < 0)) {
    return res.status(400).json({ message: 'Price must be a valid non-negative number' });
  }
  if (number_of_sessions !== undefined && (isNaN(parseInt(number_of_sessions)) || parseInt(number_of_sessions) <= 0)) {
    return res.status(400).json({ message: 'Number of sessions must be a valid positive integer' });
  }

  try {
    // Start a transaction
    const pool = require('../config/db').promise();
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      const [services] = await connection.query('SELECT id FROM services WHERE id = ?', [id]);
      if (services.length === 0) {
        await connection.rollback();
        connection.release();
        return res.status(404).json({ message: 'Service not found' });
      }
    
      let query = 'UPDATE services SET ';
      const queryParams = [];
      const updatedFields = {};
    
      if (name !== undefined) { query += 'name = ?, '; queryParams.push(name); updatedFields.name = name; }
      if (description !== undefined) { query += 'description = ?, '; queryParams.push(description || null); updatedFields.description = description || null; }
      if (price !== undefined) { query += 'price = ?, '; queryParams.push(parseFloat(price)); updatedFields.price = parseFloat(price); }
      if (number_of_sessions !== undefined) { query += 'number_of_sessions = ?, '; queryParams.push(parseInt(number_of_sessions)); updatedFields.number_of_sessions = parseInt(number_of_sessions); }
      if (article_content !== undefined) { query += 'article_content = ?, '; queryParams.push(article_content || null); updatedFields.article_content = article_content || null; }
      if (image !== undefined) { query += 'image = ?, '; queryParams.push(image || null); updatedFields.image = image || null; }
    
      query += 'updated_at = CURRENT_TIMESTAMP WHERE id = ?';
      queryParams.push(id);
    
      await connection.query(query, queryParams);
    
      // Update doctor assignments if doctor_ids is provided
      if (doctor_ids !== undefined) {
        // Remove existing assignments
        await connection.query('DELETE FROM service_doctors WHERE service_id = ?', [id]);
    
        // Add new assignments if doctor_ids is not empty
        if (Array.isArray(doctor_ids) && doctor_ids.length > 0) {
          const values = doctor_ids.map(doctorId => [id, doctorId]);
          await connection.query(
            'INSERT INTO service_doctors (service_id, doctor_id) VALUES ?',
            [values]
          );
        }
    
        // Get updated doctor list
        const [doctors] = await connection.query(
          `SELECT d.id, d.full_name 
           FROM doctors d 
           JOIN service_doctors sd ON d.id = sd.doctor_id 
           WHERE sd.service_id = ?`,
          [id]
        );
        updatedFields.doctors = doctors;
      }
    
      await connection.commit();
      connection.release();
      res.json({ message: 'Service updated successfully', updatedFields });
    } catch (error) {
      if (connection) {
        await connection.rollback();
        connection.release();
      }
      throw error;
    }
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ message: 'Server error while updating service' });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await connection.promise().query('DELETE FROM services WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Service not found or already deleted' });
    }
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') { // MySQL can return either based on version/setup for ON DELETE RESTRICT
        return res.status(400).json({ message: 'Cannot delete service. It is referenced by other records (e.g., orders).', errorCode: error.code });
    }
    res.status(500).json({ message: 'Server error while deleting service' });
  }
};

// Search services (by name or description)
exports.searchServices = async (req, res) => {
  const { searchTerm } = req.query;

  if (!searchTerm) {
    return res.status(400).json({ message: 'Please provide a search term' });
  }

  try {
    const query = `
      SELECT s.*, 
             GROUP_CONCAT(d.id) as doctor_ids,
             GROUP_CONCAT(d.full_name) as doctor_names
      FROM services s
      LEFT JOIN service_doctors sd ON s.id = sd.service_id
      LEFT JOIN doctors d ON sd.doctor_id = d.id
      WHERE s.name LIKE ? OR s.description LIKE ?
      GROUP BY s.id
      ORDER BY s.name ASC`;
    const likePattern = `%${searchTerm}%`;
    const [services] = await connection.promise().query(query, [likePattern, likePattern]);
    
    if (services.length === 0) {
      return res.status(404).json({ message: 'No services found matching your search criteria.' });
    }

    // Format the response
    const formattedServices = services.map(service => ({
      ...service,
      doctor_ids: service.doctor_ids ? service.doctor_ids.split(',').map(id => parseInt(id)) : [],
      doctor_names: service.doctor_names ? service.doctor_names.split(',') : []
    }));

    res.json(formattedServices);
  } catch (error) {
    console.error('Error searching services:', error);
    res.status(500).json({ message: 'Server error while searching services' });
  }
}; 

// Get doctors assigned to a service
exports.getServiceDoctors = async (req, res) => {
  const { id } = req.params;
  try {
    const [doctors] = await connection.promise().query(
      `SELECT d.* 
       FROM doctors d
       JOIN service_doctors sd ON d.id = sd.doctor_id
       WHERE sd.service_id = ?`,
      [id]
    );
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching service doctors:', error);
    res.status(500).json({ message: 'Server error while fetching service doctors' });
  }
};

// Assign doctor to service
exports.assignDoctorToService = async (req, res) => {
  const { serviceId, doctorId } = req.body;
  
  if (!serviceId || !doctorId) {
    return res.status(400).json({ message: 'Service ID and Doctor ID are required' });
  }

  try {
    // Kiểm tra bác sĩ có tồn tại
    const [doctors] = await connection.promise().query('SELECT id FROM doctors WHERE id = ?', [doctorId]);
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Bác sĩ không tồn tại' });
    }

    // Kiểm tra dịch vụ có tồn tại
    const [services] = await connection.promise().query('SELECT id FROM services WHERE id = ?', [serviceId]);
    if (services.length === 0) {
      return res.status(404).json({ message: 'Dịch vụ không tồn tại' });
    }

    // Kiểm tra đã được phân công chưa
    const [assignments] = await connection.promise().query(
      'SELECT * FROM service_doctors WHERE service_id = ? AND doctor_id = ?',
      [serviceId, doctorId]
    );
    if (assignments.length > 0) {
      return res.status(400).json({ message: 'Bác sĩ đã được phân công cho dịch vụ này' });
    }

    // Thêm phân công mới
    await connection.promise().query(
      'INSERT INTO service_doctors (service_id, doctor_id) VALUES (?, ?)',
      [serviceId, doctorId]
    );
    res.json({ message: 'Doctor assigned to service successfully' });
  } catch (error) {
    console.error('Error assigning doctor to service:', error);
    res.status(500).json({ message: 'Server error while assigning doctor to service' });
  }
};

// Remove doctor from service
exports.removeDoctorFromService = async (req, res) => {
  const { serviceId, doctorId } = req.params;

  try {
    // Kiểm tra phân công có tồn tại
    const [assignments] = await connection.promise().query(
      'SELECT * FROM service_doctors WHERE service_id = ? AND doctor_id = ?',
      [serviceId, doctorId]
    );
    if (assignments.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy phân công này' });
    }

    // Xóa phân công
    await connection.promise().query(
      'DELETE FROM service_doctors WHERE service_id = ? AND doctor_id = ?',
      [serviceId, doctorId]
    );
    res.json({ message: 'Doctor removed from service successfully' });
  } catch (error) {
    console.error('Error removing doctor from service:', error);
    res.status(500).json({ message: 'Server error while removing doctor from service' });
  }
};

// Get all services with their assigned doctors
exports.getAllServicesWithDoctors = async (req, res) => {
  try {
    const [services] = await connection.promise().query('SELECT * FROM service_doctor_list');
    res.json(services);
  } catch (error) {
    console.error('Error fetching services with doctors:', error);
    res.status(500).json({ message: 'Server error while fetching services with doctors' });
  }
};