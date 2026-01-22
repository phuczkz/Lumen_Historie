const connection = require('../config/db');

// Create a new doctor
exports.createDoctor = async (req, res) => {
  const { full_name, email, phone, specialty, bio, profile_picture, status, department_id, address } = req.body;

  if (!full_name || !email) {
    return res.status(400).json({ message: 'Full name and Email are required for a new doctor' });
  }

  try {
    // Check if email already exists
    const [existingDoctor] = await connection.promise().query(
      'SELECT id FROM doctors WHERE email = ?',
      [email]
    );
    if (existingDoctor.length > 0) {
      return res.status(400).json({ message: 'Doctor with this email already exists' });
    }

    // Check if department_id is valid (if provided)
    if (department_id) {
      const [department] = await connection.promise().query('SELECT id FROM departments WHERE id = ?', [department_id]);
      if (department.length === 0) {
        return res.status(400).json({ message: `Department with ID ${department_id} not found.` });
      }
    }

    const [result] = await connection.promise().query(
      'INSERT INTO doctors (full_name, email, phone, specialty, bio, profile_picture, status, department_id, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        full_name,
        email,
        phone || null,
        specialty || null,
        bio || null,
        profile_picture || null,
        status || 'active',
        department_id || null,
        address || null,
      ]
    );
    res.status(201).json({
      message: 'Doctor created successfully',
      doctorId: result.insertId,
      ...req.body, // Return all provided fields
      status: status || 'active'
    });
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ message: 'Server error while creating doctor' });
  }
};

// Get all doctors (optionally with department details)
exports.getAllDoctors = async (req, res) => {
  try {
    const query = `
      SELECT 
        d.id, d.full_name, d.email, d.phone, d.specialty, d.bio, d.profile_picture, d.status, 
        d.created_at, d.updated_at, d.department_id, d.address,
        dep.name AS department_name, dep.description AS department_description,
        COALESCE(AVG(dr.rating), 0) as average_rating,
        COUNT(dr.id) as review_count
      FROM doctors d
      LEFT JOIN departments dep ON d.department_id = dep.id
      LEFT JOIN doctor_reviews dr ON d.id = dr.doctor_id
      GROUP BY d.id, dep.name, dep.description
      ORDER BY d.full_name ASC
    `;
    const [doctors] = await connection.promise().query(query);
    
    // Get services for each doctor
    for (let doctor of doctors) {
      const [services] = await connection.promise().query(`
        SELECT s.id, s.name, s.description
        FROM services s
        INNER JOIN service_doctors sd ON s.id = sd.service_id
        WHERE sd.doctor_id = ?
      `, [doctor.id]);
      doctor.services = services;
    }
    
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ message: 'Server error while fetching doctors' });
  }
};

// Get a single doctor by ID (with department details, qualifications, experiences, services, and reviews)
exports.getDoctorById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT 
        d.id, d.full_name, d.email, d.phone, d.specialty, d.bio, d.profile_picture, d.status, 
        d.created_at, d.updated_at, d.department_id, d.address,
        dep.name AS department_name, dep.description AS department_description,
        COALESCE(AVG(dr.rating), 0) as average_rating,
        COUNT(dr.id) as review_count
      FROM doctors d
      LEFT JOIN departments dep ON d.department_id = dep.id
      LEFT JOIN doctor_reviews dr ON d.id = dr.doctor_id
      WHERE d.id = ?
      GROUP BY d.id, dep.name, dep.description
    `;
    const [doctors] = await connection.promise().query(query, [id]);
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Get qualifications
    const [qualifications] = await connection.promise().query(
      'SELECT * FROM doctor_qualifications WHERE doctor_id = ? ORDER BY completion_year DESC',
      [id]
    );

    // Get experiences
    const [experiences] = await connection.promise().query(
      'SELECT * FROM doctor_experiences WHERE doctor_id = ? ORDER BY start_date DESC',
      [id]
    );

    // Get services
    const [services] = await connection.promise().query(`
      SELECT s.id, s.name, s.description, s.price, s.number_of_sessions
      FROM services s
      INNER JOIN service_doctors sd ON s.id = sd.service_id
      WHERE sd.doctor_id = ?
    `, [id]);

    const doctor = {
      ...doctors[0],
      qualifications,
      experiences,
      services
    };

    res.json(doctor);
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ message: 'Server error while fetching doctor' });
  }
};

// Update a doctor
exports.updateDoctor = async (req, res) => {
  const { id } = req.params;
  const { full_name, email, phone, specialty, bio, profile_picture, status, department_id, address } = req.body;

  if (Object.keys(req.body).length === 0) {
    return res.status(400).json({ message: 'Nothing to update. Provide at least one field.' });
  }

  try {
    // Check if doctor exists
    const [doctors] = await connection.promise().query('SELECT id, email FROM doctors WHERE id = ?', [id]);
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // If email is being changed, check if the new email is already taken by another doctor
    if (email && email !== doctors[0].email) {
      const [existingEmail] = await connection.promise().query(
        'SELECT id FROM doctors WHERE email = ? AND id != ?',
        [email, id]
      );
      if (existingEmail.length > 0) {
        return res.status(400).json({ message: 'This email is already in use by another doctor.' });
      }
    }

    // Check if department_id is valid (if provided and changed)
    if (department_id !== undefined) { // Only validate if department_id is part of the request
        if (department_id === null) { // Allowing to set department to null
             // No validation needed if setting to null
        } else {
            const [department] = await connection.promise().query('SELECT id FROM departments WHERE id = ?', [department_id]);
            if (department.length === 0) {
                return res.status(400).json({ message: `Department with ID ${department_id} not found.` });
            }
        }
    }

    let query = 'UPDATE doctors SET ';
    const queryParams = [];
    const updatedFields = {};

    if (full_name !== undefined) { query += 'full_name = ?, '; queryParams.push(full_name); updatedFields.full_name = full_name; }
    if (email !== undefined) { query += 'email = ?, '; queryParams.push(email); updatedFields.email = email; }
    if (phone !== undefined) { query += 'phone = ?, '; queryParams.push(phone || null); updatedFields.phone = phone || null; }
    if (specialty !== undefined) { query += 'specialty = ?, '; queryParams.push(specialty || null); updatedFields.specialty = specialty || null; }
    if (bio !== undefined) { query += 'bio = ?, '; queryParams.push(bio || null); updatedFields.bio = bio || null; }
    if (profile_picture !== undefined) { query += 'profile_picture = ?, '; queryParams.push(profile_picture || null); updatedFields.profile_picture = profile_picture || null; }
    if (status !== undefined) { query += 'status = ?, '; queryParams.push(status); updatedFields.status = status; }
    if (department_id !== undefined) { query += 'department_id = ?, '; queryParams.push(department_id === '' ? null : department_id); updatedFields.department_id = (department_id === '' ? null : department_id); } // Allow setting to null
    if (address !== undefined) { query += 'address = ?, '; queryParams.push(address || null); updatedFields.address = address || null; }

    query += 'updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    queryParams.push(id);

    await connection.promise().query(query, queryParams);

    res.json({ message: 'Doctor updated successfully', id, ...updatedFields });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ message: 'Server error while updating doctor' });
  }
};

// Delete a doctor
exports.deleteDoctor = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await connection.promise().query('DELETE FROM doctors WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Doctor not found or already deleted' });
    }
    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'Cannot delete doctor. They are referenced by other records (e.g., orders).', errorCode: error.code });
    }
    res.status(500).json({ message: 'Server error while deleting doctor' });
  }
};

// Search doctors (by full_name, email, or specialty)
exports.searchDoctors = async (req, res) => {
  const { searchTerm } = req.query;

  if (!searchTerm) {
    return res.status(400).json({ message: 'Please provide a search term' });
  }

  try {
    const query = `
      SELECT 
        d.id, d.full_name, d.email, d.phone, d.specialty, d.bio, d.profile_picture, d.status, 
        d.created_at, d.updated_at, d.department_id, d.address,
        dep.name AS department_name, dep.description AS department_description,
        COALESCE(AVG(dr.rating), 0) as average_rating,
        COUNT(dr.id) as review_count
      FROM doctors d
      LEFT JOIN departments dep ON d.department_id = dep.id
      LEFT JOIN doctor_reviews dr ON d.id = dr.doctor_id
      WHERE d.full_name LIKE ? OR d.email LIKE ? OR d.specialty LIKE ? 
      GROUP BY d.id, dep.name, dep.description
      ORDER BY d.full_name ASC
    `;
    const likePattern = `%${searchTerm}%`;
    const [doctors] = await connection.promise().query(query, [likePattern, likePattern, likePattern]);
    
    if (doctors.length === 0) {
        return res.status(404).json({ message: 'No doctors found matching your search criteria.' });
    }

    // Get services for each doctor
    for (let doctor of doctors) {
      const [services] = await connection.promise().query(`
        SELECT s.id, s.name, s.description
        FROM services s
        INNER JOIN service_doctors sd ON s.id = sd.service_id
        WHERE sd.doctor_id = ?
      `, [doctor.id]);
      doctor.services = services;
    }
    
    res.json(doctors);
  } catch (error) {
    console.error('Error searching doctors:', error);
    res.status(500).json({ message: 'Server error while searching doctors' });
  }
};

// ===== QUALIFICATIONS MANAGEMENT =====

// Add qualification for a doctor
exports.addQualification = async (req, res) => {
  const { doctorId } = req.params;
  const { degree, major, completion_year, institution } = req.body;

  if (!degree || !major || !completion_year || !institution) {
    return res.status(400).json({ message: 'All qualification fields are required' });
  }

  try {
    // Check if doctor exists
    const [doctors] = await connection.promise().query('SELECT id FROM doctors WHERE id = ?', [doctorId]);
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const [result] = await connection.promise().query(
      'INSERT INTO doctor_qualifications (doctor_id, degree, major, completion_year, institution) VALUES (?, ?, ?, ?, ?)',
      [doctorId, degree, major, completion_year, institution]
    );

    res.status(201).json({
      message: 'Qualification added successfully',
      qualificationId: result.insertId,
      doctorId,
      degree,
      major,
      completion_year,
      institution
    });
  } catch (error) {
    console.error('Error adding qualification:', error);
    res.status(500).json({ message: 'Server error while adding qualification' });
  }
};

// Update qualification
exports.updateQualification = async (req, res) => {
  const { qualificationId } = req.params;
  const { degree, major, completion_year, institution } = req.body;

  try {
    const [result] = await connection.promise().query(
      'UPDATE doctor_qualifications SET degree = ?, major = ?, completion_year = ?, institution = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [degree, major, completion_year, institution, qualificationId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Qualification not found' });
    }

    res.json({ message: 'Qualification updated successfully' });
  } catch (error) {
    console.error('Error updating qualification:', error);
    res.status(500).json({ message: 'Server error while updating qualification' });
  }
};

// Delete qualification
exports.deleteQualification = async (req, res) => {
  const { qualificationId } = req.params;

  try {
    const [result] = await connection.promise().query('DELETE FROM doctor_qualifications WHERE id = ?', [qualificationId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Qualification not found' });
    }

    res.json({ message: 'Qualification deleted successfully' });
  } catch (error) {
    console.error('Error deleting qualification:', error);
    res.status(500).json({ message: 'Server error while deleting qualification' });
  }
};

// ===== EXPERIENCES MANAGEMENT =====

// Add experience for a doctor
exports.addExperience = async (req, res) => {
  const { doctorId } = req.params;
  const { position, start_date, end_date, workplace, description } = req.body;

  if (!position || !start_date || !workplace) {
    return res.status(400).json({ message: 'Position, start_date, and workplace are required' });
  }

  try {
    // Check if doctor exists
    const [doctors] = await connection.promise().query('SELECT id FROM doctors WHERE id = ?', [doctorId]);
    if (doctors.length === 0) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Convert dates from ISO string to YYYY-MM-DD format for MySQL
    const formatDateForMySQL = (dateString) => {
      if (!dateString) return null;
      try {
        // If it's already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return dateString;
        }
        // Convert ISO string to YYYY-MM-DD
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error formatting date:', error);
        return null;
      }
    };

    const formattedStartDate = formatDateForMySQL(start_date);
    const formattedEndDate = end_date ? formatDateForMySQL(end_date) : null;

    console.log('Original dates:', { start_date, end_date });
    console.log('Formatted dates:', { formattedStartDate, formattedEndDate });

    const [result] = await connection.promise().query(
      'INSERT INTO doctor_experiences (doctor_id, position, start_date, end_date, workplace, description) VALUES (?, ?, ?, ?, ?, ?)',
      [doctorId, position, formattedStartDate, formattedEndDate, workplace, description || null]
    );

    res.status(201).json({
      message: 'Experience added successfully',
      experienceId: result.insertId,
      doctorId,
      position,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      workplace,
      description
    });
  } catch (error) {
    console.error('Error adding experience:', error);
    res.status(500).json({ message: 'Server error while adding experience' });
  }
};

// Update experience
exports.updateExperience = async (req, res) => {
  const { experienceId } = req.params;
  const { position, start_date, end_date, workplace, description } = req.body;

  try {
    // Convert dates from ISO string to YYYY-MM-DD format for MySQL
    const formatDateForMySQL = (dateString) => {
      if (!dateString) return null;
      try {
        // If it's already in YYYY-MM-DD format, return as is
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
          return dateString;
        }
        // Convert ISO string to YYYY-MM-DD
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      } catch (error) {
        console.error('Error formatting date:', error);
        return null;
      }
    };

    const formattedStartDate = formatDateForMySQL(start_date);
    const formattedEndDate = end_date ? formatDateForMySQL(end_date) : null;

    const [result] = await connection.promise().query(
      'UPDATE doctor_experiences SET position = ?, start_date = ?, end_date = ?, workplace = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [position, formattedStartDate, formattedEndDate, workplace, description || null, experienceId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    res.json({ message: 'Experience updated successfully' });
  } catch (error) {
    console.error('Error updating experience:', error);
    res.status(500).json({ message: 'Server error while updating experience' });
  }
};

// Delete experience
exports.deleteExperience = async (req, res) => {
  const { experienceId } = req.params;

  try {
    const [result] = await connection.promise().query('DELETE FROM doctor_experiences WHERE id = ?', [experienceId]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Error deleting experience:', error);
    res.status(500).json({ message: 'Server error while deleting experience' });
  }
}; 