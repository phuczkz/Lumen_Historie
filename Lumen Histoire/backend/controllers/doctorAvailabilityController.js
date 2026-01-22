const connection = require('../config/db');

// Create a new doctor availability slot
exports.createDoctorAvailability = async (req, res) => {
  const { doctor_id, available_date, start_time, end_time, status, is_active } = req.body;

  if (doctor_id === undefined || !available_date || !start_time || !end_time) {
    return res.status(400).json({ message: 'Doctor ID, Available Date, Start Time, and End Time are required.' });
  }

  // Basic validation for date and time formats (more robust validation can be added)
  if (isNaN(new Date(available_date).getTime())) {
      return res.status(400).json({ message: 'Invalid available_date format.' });
  }
  // Assuming start_time and end_time are in HH:MM:SS or HH:MM format
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return res.status(400).json({ message: 'Invalid start_time or end_time format. Use HH:MM or HH:MM:SS.'});
  }
  if (start_time >= end_time) {
      return res.status(400).json({ message: 'Start time must be before end time.' });
  }

  try {
    // Validate doctor_id exists
    const [doctor] = await connection.promise().query('SELECT id FROM doctors WHERE id = ?', [doctor_id]);
    if (doctor.length === 0) {
      return res.status(404).json({ message: `Doctor with ID ${doctor_id} not found.` });
    }

    const availabilityData = {
      doctor_id: parseInt(doctor_id),
      available_date: available_date,
      start_time, // Store as provided string
      end_time,   // Store as provided string
      status: status || 'available', // Default status
      is_active: is_active !== undefined ? Boolean(is_active) : true, // Default is_active to true
    };

    const [result] = await connection.promise().query('INSERT INTO doctor_availability SET ?', availabilityData);
    
    res.status(201).json({
      message: 'Doctor availability slot created successfully',
      availabilityId: result.insertId,
      ...availabilityData
    });

  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'This availability slot (doctor, date, start time, end time) already exists.' });
    }
    console.error('Error creating doctor availability:', error);
    res.status(500).json({ message: 'Server error while creating doctor availability' });
  }
};

// Get all availability slots for a specific doctor
exports.getDoctorAvailabilityByDoctorId = async (req, res) => {
  const { doctorId } = req.params;
  const { startDate, endDate, status, isActive } = req.query; // Optional query params for filtering

  try {
    // Check if doctor exists
    const [doctor] = await connection.promise().query('SELECT id FROM doctors WHERE id = ?', [doctorId]);
    if (doctor.length === 0) return res.status(404).json({ message: `Doctor with ID ${doctorId} not found.` });

    let query = 'SELECT da.id, da.doctor_id, da.available_date, da.start_time, da.end_time, da.status, da.is_active, ' +
                'd.full_name AS doctor_name ' +
                'FROM doctor_availability da JOIN doctors d ON da.doctor_id = d.id ' +
                'WHERE da.doctor_id = ?';
    const queryParams = [doctorId];

    if (startDate) {
        query += ' AND da.available_date >= ?';
        queryParams.push(new Date(startDate).toISOString().slice(0,10));
    }
    if (endDate) {
        query += ' AND da.available_date <= ?';
        queryParams.push(new Date(endDate).toISOString().slice(0,10));
    }
    if (status) {
        query += ' AND da.status = ?';
        queryParams.push(status);
    }
    if (isActive !== undefined) {
        query += ' AND da.is_active = ?';
        queryParams.push(Boolean(isActive === 'true' || isActive === '1'));
    }

    query += ' ORDER BY da.available_date ASC, da.start_time ASC';

    const [availabilities] = await connection.promise().query(query, queryParams);
    res.json(availabilities);
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({ message: 'Server error while fetching doctor availability' });
  }
};

// Get a single availability slot by its ID
exports.getDoctorAvailabilityById = async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'SELECT da.id, da.doctor_id, da.available_date, da.start_time, da.end_time, da.status, da.is_active, ' +
                  'd.full_name AS doctor_name ' +
                  'FROM doctor_availability da JOIN doctors d ON da.doctor_id = d.id ' +
                  'WHERE da.id = ?';
    const [availabilities] = await connection.promise().query(query, [id]);
    if (availabilities.length === 0) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }
    res.json(availabilities[0]);
  } catch (error) {
    console.error('Error fetching availability slot:', error);
    res.status(500).json({ message: 'Server error while fetching availability slot' });
  }
};

// Update a doctor availability slot
exports.updateDoctorAvailability = async (req, res) => {
  const { id } = req.params;
  const { available_date, start_time, end_time, status, is_active } = req.body;

  if (!available_date && !start_time && !end_time && status === undefined && is_active === undefined) {
    return res.status(400).json({ message: 'Nothing to update. Provide at least one field.' });
  }

  // Basic validation for date and time formats if provided
  if (available_date && isNaN(new Date(available_date).getTime())) {
      return res.status(400).json({ message: 'Invalid available_date format.' });
  }
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
  if (start_time && !timeRegex.test(start_time)) {
      return res.status(400).json({ message: 'Invalid start_time format. Use HH:MM or HH:MM:SS.'});
  }
  if (end_time && !timeRegex.test(end_time)) {
      return res.status(400).json({ message: 'Invalid end_time format. Use HH:MM or HH:MM:SS.'});
  }
  // Note: Complex validation like start_time < end_time when only one is provided requires fetching existing record.

  try {
    const [existingSlots] = await connection.promise().query('SELECT doctor_id, available_date, start_time, end_time FROM doctor_availability WHERE id = ?', [id]);
    if (existingSlots.length === 0) {
      return res.status(404).json({ message: 'Availability slot not found' });
    }
    const currentSlot = existingSlots[0];

    const fieldsToUpdate = {};
    if (available_date) fieldsToUpdate.available_date = new Date(available_date).toISOString().slice(0, 10);
    if (start_time) fieldsToUpdate.start_time = start_time;
    if (end_time) fieldsToUpdate.end_time = end_time;
    if (status !== undefined) fieldsToUpdate.status = status;
    if (is_active !== undefined) fieldsToUpdate.is_active = Boolean(is_active);
    
    // Validate start_time < end_time if both are being set or one is set and other exists
    const finalStartTime = fieldsToUpdate.start_time || currentSlot.start_time;
    const finalEndTime = fieldsToUpdate.end_time || currentSlot.end_time;
    if (finalStartTime >= finalEndTime) {
        return res.status(400).json({ message: 'Start time must be before end time.' });
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({ message: 'No valid fields provided for update.' });
    }
    // The table in schema doesn't have an explicit updated_at, so not setting it.

    await connection.promise().query('UPDATE doctor_availability SET ? WHERE id = ?', [fieldsToUpdate, id]);

    res.json({ message: 'Doctor availability slot updated successfully', id, ...fieldsToUpdate });
  } catch (error) {
     if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ message: 'Updating this slot conflicts with an existing availability (doctor, date, start time, end time).' });
    }
    console.error('Error updating doctor availability:', error);
    res.status(500).json({ message: 'Server error while updating doctor availability' });
  }
};

// Delete a doctor availability slot
exports.deleteDoctorAvailability = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await connection.promise().query('DELETE FROM doctor_availability WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Availability slot not found or already deleted' });
    }
    res.json({ message: 'Doctor availability slot deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor availability:', error);
    // This table is not directly referenced by others with ON DELETE RESTRICT in the provided schema.
    // However, deleting availability might impact scheduling logic if not handled carefully.
    res.status(500).json({ message: 'Server error while deleting doctor availability' });
  }
}; 