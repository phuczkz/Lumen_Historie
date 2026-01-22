const connection = require('../config/db');

// Create a new department
exports.createDepartment = async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Department name is required' });
  }

  try {
    const [result] = await connection.promise().query(
      'INSERT INTO departments (name, description) VALUES (?, ?)',
      [name, description || null] // Store null if description is not provided
    );
    res.status(201).json({
      message: 'Department created successfully',
      departmentId: result.insertId,
      name,
      description,
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ message: 'Server error while creating department' });
  }
};

// Get all departments
exports.getAllDepartments = async (req, res) => {
  try {
    const [departments] = await connection.promise().query('SELECT id, name, description, created_at, updated_at FROM departments ORDER BY name ASC');
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ message: 'Server error while fetching departments' });
  }
};

// Get a single department by ID
exports.getDepartmentById = async (req, res) => {
  const { id } = req.params;
  try {
    const [departments] = await connection.promise().query(
      'SELECT id, name, description, created_at, updated_at FROM departments WHERE id = ?',
      [id]
    );
    if (departments.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(departments[0]);
  } catch (error) {
    console.error('Error fetching department:', error);
    res.status(500).json({ message: 'Server error while fetching department' });
  }
};

// Update a department
exports.updateDepartment = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!name && !description) {
    return res.status(400).json({ message: 'Nothing to update. Provide name or description.'});
  }

  try {
    // Check if department exists
    const [departments] = await connection.promise().query('SELECT id FROM departments WHERE id = ?', [id]);
    if (departments.length === 0) {
      return res.status(404).json({ message: 'Department not found' });
    }

    let query = 'UPDATE departments SET ';
    const queryParams = [];
    if (name) {
      query += 'name = ? ';
      queryParams.push(name);
    }
    if (description !== undefined) { // Allow setting description to null or empty string
      if (queryParams.length > 0) query += ', ';
      query += 'description = ? ';
      queryParams.push(description);
    }
    query += ', updated_at = CURRENT_TIMESTAMP WHERE id = ?';
    queryParams.push(id);

    await connection.promise().query(query, queryParams);

    res.json({ message: 'Department updated successfully', id, name, description });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ message: 'Server error while updating department' });
  }
};

// Delete a department
exports.deleteDepartment = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await connection.promise().query('DELETE FROM departments WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Department not found or already deleted' });
    }
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    // Handle foreign key constraint errors, e.g., if doctors are assigned to this department
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({ message: 'Cannot delete department. It is referenced by other records (e.g., doctors).', errorCode: error.code });
    }
    res.status(500).json({ message: 'Server error while deleting department' });
  }
};

// Search departments (by name)
exports.searchDepartments = async (req, res) => {
  const { searchTerm } = req.query;

  if (!searchTerm) {
    return res.status(400).json({ message: 'Please provide a search term' });
  }

  try {
    const query = `SELECT id, name, description, created_at, updated_at 
                     FROM departments 
                     WHERE name LIKE ? OR description LIKE ? 
                     ORDER BY name ASC`;
    const likePattern = `%${searchTerm}%;`
    const [departments] = await connection.promise().query(query, [likePattern, likePattern]);
    
    if (departments.length === 0) {
        return res.status(404).json({ message: 'No departments found matching your search criteria.' });
    }
    res.json(departments);
  } catch (error) {
    console.error('Error searching departments:', error);
    res.status(500).json({ message: 'Server error while searching departments' });
  }
}; 