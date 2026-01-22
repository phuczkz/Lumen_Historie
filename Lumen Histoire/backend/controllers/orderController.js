const connection = require("../config/db");

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const {
      client_id,
      doctor_id,
      service_id,
      number_of_sessions,
      amount,
      payment_method = "cash",
      payment_status = "pending",
      availability_ids,
    } = req.body;

    // Validate required fields
    if (
      !client_id ||
      !doctor_id ||
      !service_id ||
      !number_of_sessions ||
      !amount
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Validate numeric fields
    if (
      !Number.isInteger(client_id) ||
      !Number.isInteger(doctor_id) ||
      !Number.isInteger(service_id) ||
      !Number.isInteger(number_of_sessions) ||
      typeof amount !== "number"
    ) {
      return res.status(400).json({ message: "Invalid field types" });
    }

    // Verify service exists and get its session count
    const [services] = await connection
      .promise()
      .query("SELECT number_of_sessions FROM services WHERE id = ?", [
        service_id,
      ]);

    if (services.length === 0) {
      return res.status(400).json({ message: "Service not found" });
    }

    const serviceSessionCount = services[0].number_of_sessions;
    if (number_of_sessions > serviceSessionCount) {
      return res.status(400).json({
        message: `Number of sessions cannot exceed service maximum (${serviceSessionCount})`,
      });
    }

    // If availability_ids are provided, validate them
    if (availability_ids && Array.isArray(availability_ids)) {
      if (availability_ids.length !== number_of_sessions) {
        return res.status(400).json({
          message: `Number of availability slots (${availability_ids.length}) must match number of sessions (${number_of_sessions})`,
        });
      }

      // Verify all availability slots exist and belong to the selected doctor
      const [availabilityCheck] = await connection.promise().query(
        `SELECT id, doctor_id, available_date, start_time, status, is_active 
         FROM doctor_availability 
         WHERE id IN (${availability_ids.map(() => "?").join(",")}) 
         AND doctor_id = ? 
         AND status = 'available' 
         AND is_active = 1`,
        [...availability_ids, doctor_id]
      );

      if (availabilityCheck.length !== availability_ids.length) {
        return res.status(400).json({
          message: "Some availability slots are invalid or not available",
        });
      }
    }

    // Create order data object
    const orderData = {
      client_id,
      doctor_id,
      service_id,
      number_of_sessions,
      amount,
      payment_method,
      payment_status,
      status: "pending",
      availability_ids: availability_ids
        ? JSON.stringify(availability_ids)
        : null, // Store as JSON
      created_at: new Date(),
      updated_at: new Date(),
    };

    const [result] = await connection
      .promise()
      .query("INSERT INTO orders SET ?", orderData);
    const orderId = result.insertId;

    // If availability_ids are provided, create appointments immediately
    if (availability_ids && Array.isArray(availability_ids)) {
      console.log(
        `Creating appointments for order ${orderId} with specific availability slots`
      );

      for (let i = 0; i < availability_ids.length; i++) {
        const availabilityId = availability_ids[i];

        // Get the availability details
        const [availability] = await connection
          .promise()
          .query(
            "SELECT available_date, start_time FROM doctor_availability WHERE id = ?",
            [availabilityId]
          );

        if (availability.length > 0) {
          const { available_date, start_time } = availability[0];

          // Create the scheduled_at datetime
          const date = new Date(available_date);
          date.setDate(date.getDate() + 0);
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const formattedDate = `${year}-${month}-${day}`;

          // Đảm bảo time có định dạng HH:MM:SS
          const time =
            start_time.length === 5 ? start_time + ":00" : start_time;

          // Kết hợp ngày và giờ theo định dạng MySQL
          const scheduled_at = `${formattedDate} ${time}`;

          await connection.promise().query(
            `INSERT INTO appointments (order_id, availability_id, session_number, scheduled_at, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())`,
            [orderId, availabilityId, i + 1, scheduled_at]
          );

          // Mark the availability slot as used (gỡ comment để khóa lịch)
          await connection
            .promise()
            .query(
              'UPDATE doctor_availability SET status = "booked" WHERE id = ?',
              [availabilityId]
            );
        }
      }

      console.log(
        `Successfully created ${availability_ids.length} appointments for order ${orderId}`
      );
    }

    res.status(201).json({
      message:
        availability_ids && availability_ids.length > 0
          ? "Order created successfully with scheduled appointments."
          : "Order created successfully. Appointments will be created when order is confirmed.",
      orderId,
      ...orderData,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ message: "Server error while creating order" });
  }
};

// Get all orders with details
exports.getAllOrders = async (req, res) => {
  try {
    const query = `
      SELECT 
        o.id, o.number_of_sessions, o.status, o.notes, o.amount, o.payment_method, o.payment_status, o.paid_at, 
        o.created_at AS order_created_at, o.updated_at AS order_updated_at,
        c.id AS client_id, c.full_name AS client_name, c.email AS client_email,
        d.id AS doctor_id, d.full_name AS doctor_name, d.email AS doctor_email,
        s.id AS service_id, s.name AS service_name, s.price AS service_price, s.number_of_sessions AS service_sessions,
        COALESCE(
          (SELECT COUNT(*) 
           FROM appointments a 
           WHERE a.order_id = o.id AND a.status = 'completed'), 0
        ) AS completed_sessions
      FROM orders o
      JOIN clients c ON o.client_id = c.id
      JOIN doctors d ON o.doctor_id = d.id
      JOIN services s ON o.service_id = s.id
      ORDER BY o.created_at DESC
    `;
    const [orders] = await connection.promise().query(query);
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};

// Get a single order by ID with details and its appointments
exports.getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const orderQuery = `
      SELECT 
        o.id, o.number_of_sessions, o.completed_sessions, o.status, o.notes, o.amount, 
        o.payment_method, o.payment_status, o.paid_at, o.started_at, o.completed_at,
        o.created_at AS order_created_at, o.updated_at AS order_updated_at,
        c.id AS client_id, c.full_name AS client_name, c.email AS client_email,
        d.id AS doctor_id, d.full_name AS doctor_name, d.email AS doctor_email,
        s.id AS service_id, s.name AS service_name, s.price AS service_price, s.number_of_sessions AS service_sessions
      FROM orders o
      JOIN clients c ON o.client_id = c.id
      JOIN doctors d ON o.doctor_id = d.id
      JOIN services s ON o.service_id = s.id
      WHERE o.id = ?
    `;
    const [orders] = await connection.promise().query(orderQuery, [id]);

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Lấy appointments với thông tin doctor_availability
    const appointmentsQuery = `
      SELECT 
        a.id, a.session_number, a.scheduled_at, a.status, a.notes, a.completion_notes, 
        a.created_at, a.updated_at, a.availability_id,
        da.available_date, da.start_time, da.end_time, da.status as availability_status
      FROM appointments a
      LEFT JOIN doctor_availability da ON a.availability_id = da.id
      WHERE a.order_id = ? 
      ORDER BY a.session_number ASC
    `;
    const [appointments] = await connection
      .promise()
      .query(appointmentsQuery, [id]);

    // Return order with appointments array
    res.json({ ...orders[0], appointments });
  } catch (error) {
    console.error("Error fetching order details:", error);
    res
      .status(500)
      .json({ message: "Server error while fetching order details" });
  }
};

// Update an order (e.g., status, notes, payment details)
exports.updateOrder = async (req, res) => {
  const { id } = req.params;
  const {
    status,
    notes,
    payment_method,
    payment_status,
    paid_at,
    number_of_sessions,
    amount,
  } = req.body;

  if (Object.keys(req.body).length === 0) {
    return res
      .status(400)
      .json({ message: "Nothing to update. Provide at least one field." });
  }

  try {
    const [existingOrders] = await connection
      .promise()
      .query("SELECT id FROM orders WHERE id = ?", [id]);
    if (existingOrders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const fieldsToUpdate = {};
    if (status !== undefined) fieldsToUpdate.status = status;
    if (notes !== undefined) fieldsToUpdate.notes = notes === "" ? null : notes; // Allow setting notes to null
    if (payment_method !== undefined)
      fieldsToUpdate.payment_method = payment_method;
    if (payment_status !== undefined)
      fieldsToUpdate.payment_status = payment_status;
    if (paid_at !== undefined)
      fieldsToUpdate.paid_at = paid_at ? new Date(paid_at) : null;
    if (number_of_sessions !== undefined) {
      if (
        isNaN(parseInt(number_of_sessions)) ||
        parseInt(number_of_sessions) <= 0
      ) {
        return res.status(400).json({
          message: "Number of sessions must be a positive integer if provided.",
        });
      }
      fieldsToUpdate.number_of_sessions = parseInt(number_of_sessions);
    }
    if (amount !== undefined) {
      if (isNaN(parseFloat(amount)) || parseFloat(amount) < 0) {
        return res.status(400).json({
          message: "Amount must be a valid non-negative number if provided.",
        });
      }
      fieldsToUpdate.amount = parseFloat(amount);
    }

    // If only specific fields are being updated and they are all undefined, it means no valid fields were passed.
    if (Object.keys(fieldsToUpdate).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided for update." });
    }

    fieldsToUpdate.updated_at = new Date();

    await connection
      .promise()
      .query("UPDATE orders SET ? WHERE id = ?", [fieldsToUpdate, id]);

    res.json({ message: "Order updated successfully", id, ...fieldsToUpdate });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ message: "Server error while updating order" });
  }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await connection
      .promise()
      .query("DELETE FROM orders WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ message: "Server error while deleting order" });
  }
};

// Helper function to update completed_sessions count for an order
const updateCompletedSessions = async (orderId) => {
  try {
    const [result] = await connection.promise().query(
      `UPDATE orders SET completed_sessions = (
        SELECT COUNT(*) FROM appointments 
        WHERE order_id = ? AND status = 'completed'
      ) WHERE id = ?`,
      [orderId, orderId]
    );
    return result;
  } catch (error) {
    console.error("Error updating completed sessions:", error);
    throw error;
  }
};

// Update order status
exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Validate status
  const validStatuses = [
    "pending",
    "confirmed",
    "in_progress",
    "completed",
    "cancelled",
  ];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  try {
    // Get current order data to check if appointments need to be created
    const [currentOrder] = await connection
      .promise()
      .query("SELECT status, number_of_sessions FROM orders WHERE id = ?", [
        id,
      ]);

    if (currentOrder.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const oldStatus = currentOrder[0].status;
    const numberOfSessions = currentOrder[0].number_of_sessions;

    // Update order status
    const [result] = await connection
      .promise()
      .query("UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?", [
        status,
        id,
      ]);

    // If status changed from pending to confirmed, create appointments only if none exist
    if (oldStatus === "pending" && status === "confirmed") {
      // Check if appointments already exist for this order
      const [existingAppointments] = await connection
        .promise()
        .query(
          "SELECT COUNT(*) as count FROM appointments WHERE order_id = ?",
          [id]
        );

      if (existingAppointments[0].count === 0) {
        console.log(
          `Creating ${numberOfSessions} appointments for order ${id}`
        );

        // Create appointments for each session
        for (
          let sessionNumber = 1;
          sessionNumber <= numberOfSessions;
          sessionNumber++
        ) {
          // Schedule appointments 1 week apart, starting from next week
          const scheduledDate = new Date();
          scheduledDate.setDate(scheduledDate.getDate() + 7); // Start from next week
          scheduledDate.setDate(
            scheduledDate.getDate() + (sessionNumber - 1) * 7
          ); // Then add weeks for each session
          scheduledDate.setHours(10, 0, 0, 0); // Set default time to 10:00 AM

          await connection.promise().query(
            `INSERT INTO appointments (order_id, session_number, scheduled_at, status, created_at, updated_at) 
             VALUES (?, ?, ?, 'pending', NOW(), NOW())`,
            [id, sessionNumber, scheduledDate]
          );
        }

        console.log(
          `Successfully created ${numberOfSessions} appointments for order ${id}`
        );
      } else {
        console.log(
          `Order ${id} already has appointments, skipping automatic creation`
        );
      }
    }

    // Get updated order data with appointments
    const [orders] = await connection.promise().query(
      `SELECT 
        o.id, o.number_of_sessions, o.completed_sessions, o.status, o.notes, o.amount, 
        o.payment_method, o.payment_status, o.paid_at, o.started_at, o.completed_at,
        o.created_at AS order_created_at, o.updated_at AS order_updated_at,
        c.id AS client_id, c.full_name AS client_name, c.email AS client_email,
        d.id AS doctor_id, d.full_name AS doctor_name, d.email AS doctor_email,
        s.id AS service_id, s.name AS service_name, s.price AS service_price, 
        s.number_of_sessions AS service_sessions
      FROM orders o
      JOIN clients c ON o.client_id = c.id
      JOIN doctors d ON o.doctor_id = d.id
      JOIN services s ON o.service_id = s.id
      WHERE o.id = ?`,
      [id]
    );

    // Get appointments for this order
    const [appointments] = await connection.promise().query(
      `SELECT id, session_number, scheduled_at, status, notes, completion_notes, created_at, updated_at 
       FROM appointments 
       WHERE order_id = ? 
       ORDER BY session_number ASC`,
      [id]
    );

    res.json({
      message: "Order status updated successfully",
      ...orders[0],
      appointments,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res
      .status(500)
      .json({ message: "Server error while updating order status" });
  }
};
