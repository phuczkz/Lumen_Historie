const connection = require("../config/db");
const { StatusCodes } = require("http-status-codes");

const appointmentController = {
  // Get appointments for the logged-in user
  getMyAppointments: async (req, res) => {
    try {
      const userId = req.client.id;
      console.log("Client ID:", userId);

      // Get appointments from new appointments table
      const [appointments] = await connection.promise().query(
        `SELECT 
          a.id,
          a.order_id,
          a.availability_id,
          a.session_number,
          a.scheduled_at,
          a.status,
          a.notes,
          a.completion_notes,
          a.created_at,
          a.updated_at,
          o.client_id,
          o.doctor_id,
          o.service_id,
          o.number_of_sessions,
          o.completed_sessions,
          d.full_name AS doctor_name,
          d.specialty AS doctor_specialty,
          d.profile_picture AS doctor_profile_picture,
          sv.name AS service_title,
          sv.description AS service_description,
          sv.price AS service_price,
          sv.number_of_sessions AS service_sessions
        FROM appointments a
        JOIN orders o ON a.order_id = o.id
        LEFT JOIN doctors d ON o.doctor_id = d.id
        LEFT JOIN services sv ON o.service_id = sv.id
        WHERE o.client_id = ?
        ORDER BY a.scheduled_at DESC`,
        [userId]
      );

      // Format response to match frontend interface
      const formattedAppointments = appointments.map((apt) => ({
        id: apt.id,
        order_id: apt.order_id,
        client_id: apt.client_id,
        doctor_id: apt.doctor_id,
        service_id: apt.service_id,
        session_number: apt.session_number,
        scheduled_at: apt.scheduled_at,
        status: apt.status,
        notes: apt.notes,
        completion_notes: apt.completion_notes,
        created_at: apt.created_at,
        updated_at: apt.updated_at,
        availability_id: apt.availability_id,
        doctor: apt.doctor_name
          ? {
              id: apt.doctor_id,
              full_name: apt.doctor_name,
              specialty: apt.doctor_specialty,
              profile_picture: apt.doctor_profile_picture,
            }
          : null,
        service: apt.service_title
          ? {
              id: apt.service_id,
              title: apt.service_title,
              name: apt.service_title,
              description: apt.service_description,
              price: apt.service_price,
              number_of_sessions: apt.service_sessions,
            }
          : null,
        progress: {
          completed_sessions: apt.completed_sessions || 0,
          total_sessions: apt.number_of_sessions || 1,
        },
      }));

      res.json(formattedAppointments);
    } catch (error) {
      console.error("Error in getMyAppointments:", error);
      res
        .status(500)
        .json({ message: "Server error while fetching appointments" });
    }
  },

  // Get all appointments (for admin)
  getAllAppointments: async (req, res) => {
    try {
      const [appointments] = await connection.promise().query(
        `SELECT 
          a.id,
          a.order_id,
          a.availability_id,
          a.session_number,
          a.scheduled_at,
          a.status,
          a.notes,
          a.completion_notes,
          a.created_at,
          a.updated_at,
          o.client_id,
          o.doctor_id,
          o.service_id,
          o.number_of_sessions,
          o.completed_sessions,
          c.full_name AS client_name,
          c.email AS client_email,
          d.full_name AS doctor_name,
          d.specialty AS doctor_specialty,
          sv.name AS service_title,
          sv.price AS service_price
        FROM appointments a
        JOIN orders o ON a.order_id = o.id
        LEFT JOIN clients c ON o.client_id = c.id
        LEFT JOIN doctors d ON o.doctor_id = d.id
        LEFT JOIN services sv ON o.service_id = sv.id
        ORDER BY a.scheduled_at DESC`
      );

      res.json(appointments);
    } catch (error) {
      console.error("Error in getAllAppointments:", error);
      res
        .status(500)
        .json({ message: "Server error while fetching appointments" });
    }
  },

  // Cancel an appointment
  cancelAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.client.id;

      // Check if appointment exists and belongs to user
      const [appointments] = await connection.promise().query(
        `SELECT a.*, o.doctor_id, o.client_id
         FROM appointments a 
         JOIN orders o ON a.order_id = o.id 
         WHERE a.id = ? AND o.client_id = ?`,
        [id, userId]
      );

      if (appointments.length === 0) {
        return res.status(StatusCodes.NOT_FOUND).json({
          message: "Lịch hẹn không tồn tại hoặc không thuộc về bạn.",
        });
      }

      const appointment = appointments[0];
      if (appointment.status === "cancelled") {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Lịch hẹn đã được hủy trước đó.",
        });
      }

      if (appointment.status === "completed") {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Không thể hủy lịch hẹn đã hoàn thành.",
        });
      }

      // Update appointment status
      await connection
        .promise()
        .query(
          "UPDATE appointments SET status = ?, updated_at = NOW() WHERE id = ?",
          ["cancelled", id]
        );

      res.json({
        message: "Lịch hẹn đã được hủy thành công.",
      });
    } catch (error) {
      console.error("Error in cancelAppointment:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "Không thể hủy lịch hẹn.",
      });
    }
  },

  // Complete an appointment (for doctors/admin)
  completeAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const { completion_notes } = req.body;

      // Check if appointment exists
      const [appointments] = await connection
        .promise()
        .query("SELECT order_id, status FROM appointments WHERE id = ?", [id]);

      if (appointments.length === 0) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const appointment = appointments[0];
      const orderId = appointment.order_id;

      if (appointment.status === "completed") {
        return res
          .status(400)
          .json({ message: "Appointment already completed" });
      }

      if (appointment.status === "cancelled") {
        return res
          .status(400)
          .json({ message: "Cannot complete cancelled appointment" });
      }

      // Update appointment to completed
      await connection
        .promise()
        .query(
          "UPDATE appointments SET status = ?, completion_notes = ?, updated_at = NOW() WHERE id = ?",
          ["completed", completion_notes || null, id]
        );

      // Update order's completed_sessions count
      await connection.promise().query(
        `UPDATE orders 
         SET completed_sessions = (
           SELECT COUNT(*) 
           FROM appointments 
           WHERE order_id = ? AND status = 'completed'
         ),
         updated_at = NOW()
         WHERE id = ?`,
        [orderId, orderId]
      );

      console.log(
        `Completed appointment ${id} and updated completed_sessions for order ${orderId}`
      );

      res.json({ message: "Appointment completed successfully" });
    } catch (error) {
      console.error("Error in completeAppointment:", error);
      res
        .status(500)
        .json({ message: "Server error while completing appointment" });
    }
  },

  // Update appointment status
  updateAppointmentStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status, notes, completion_notes } = req.body;

      const validStatuses = [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
        "rescheduled",
      ];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status. Must be one of: ${validStatuses.join(
            ", "
          )}`,
        });
      }

      // Get current appointment data
      const [currentAppointment] = await connection
        .promise()
        .query("SELECT order_id, status FROM appointments WHERE id = ?", [id]);

      if (currentAppointment.length === 0) {
        return res.status(404).json({ message: "Appointment not found" });
      }

      const orderId = currentAppointment[0].order_id;
      const oldStatus = currentAppointment[0].status;

      // Update appointment
      await connection.promise().query(
        `UPDATE appointments 
         SET status = ?, notes = ?, completion_notes = ?, updated_at = NOW() 
         WHERE id = ?`,
        [status, notes || null, completion_notes || null, id]
      );

      // If appointment was completed, update order's completed_sessions count
      if (status === "completed" && oldStatus !== "completed") {
        await connection.promise().query(
          `UPDATE orders 
           SET completed_sessions = (
             SELECT COUNT(*) 
             FROM appointments 
             WHERE order_id = ? AND status = 'completed'
           ),
           updated_at = NOW()
           WHERE id = ?`,
          [orderId, orderId]
        );

        console.log(
          `Updated completed_sessions for order ${orderId} after appointment ${id} completion`
        );
      }
      // If appointment status changed from completed to something else, update count
      else if (oldStatus === "completed" && status !== "completed") {
        await connection.promise().query(
          `UPDATE orders 
           SET completed_sessions = (
             SELECT COUNT(*) 
             FROM appointments 
             WHERE order_id = ? AND status = 'completed'
           ),
           updated_at = NOW()
           WHERE id = ?`,
          [orderId, orderId]
        );

        console.log(
          `Updated completed_sessions for order ${orderId} after appointment ${id} status change`
        );
      }

      res.json({ message: "Appointment status updated successfully" });
    } catch (error) {
      console.error("Error in updateAppointmentStatus:", error);
      res
        .status(500)
        .json({ message: "Server error while updating appointment" });
    }
  },

  // Reschedule appointment
  rescheduleAppointment: async (req, res) => {
    try {
      const { id } = req.params;
      const { new_scheduled_at } = req.body;

      if (!new_scheduled_at) {
        return res
          .status(400)
          .json({ message: "New scheduled time is required" });
      }

      // Update appointment time and status
      await connection.promise().query(
        `UPDATE appointments 
         SET scheduled_at = ?, status = 'rescheduled', updated_at = NOW() 
         WHERE id = ?`,
        [new_scheduled_at, id]
      );

      res.json({ message: "Appointment rescheduled successfully" });
    } catch (error) {
      console.error("Error in rescheduleAppointment:", error);
      res
        .status(500)
        .json({ message: "Server error while rescheduling appointment" });
    }
  },

  // Get appointments by week range with full details
  getAppointmentsByWeek: async (req, res) => {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        return res
          .status(400)
          .json({ message: "Start and end dates are required" });
      }

      const query = `
        SELECT 
          a.id, a.order_id, a.session_number, a.scheduled_at, a.status, a.notes, a.completion_notes,
          a.created_at, a.updated_at, a.availability_id,
          c.full_name as client_name,
          d.full_name as doctor_name,
          s.name as service_name,
          da.start_time, da.end_time, da.status as availability_status
        FROM appointments a
        JOIN orders o ON a.order_id = o.id
        JOIN clients c ON o.client_id = c.id
        JOIN doctors d ON o.doctor_id = d.id
        JOIN services s ON o.service_id = s.id
        LEFT JOIN doctor_availability da ON a.availability_id = da.id
        WHERE DATE(a.scheduled_at) BETWEEN ? AND ?
        ORDER BY a.scheduled_at ASC
      `;

      const [appointments] = await connection
        .promise()
        .query(query, [start, end]);
      res.json(appointments);
    } catch (error) {
      console.error("Error fetching appointments by week:", error);
      res
        .status(500)
        .json({ message: "Server error while fetching appointments" });
    }
  },

  // Get appointments by doctor ID (for admin viewing doctor details)
  getAppointmentsByDoctorId: async (req, res) => {
    try {
      const { doctorId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Get total count
      const [totalCount] = await connection.promise().query(
        `SELECT COUNT(*) as count 
         FROM appointments a
         JOIN orders o ON a.order_id = o.id
         WHERE o.doctor_id = ?`,
        [doctorId]
      );

      // Get appointments with details
      const [appointments] = await connection.promise().query(
        `SELECT 
          a.id,
          a.order_id,
          a.availability_id,
          a.session_number,
          a.scheduled_at,
          a.status,
          a.notes,
          a.completion_notes,
          a.created_at,
          a.updated_at,
          o.client_id,
          o.doctor_id,
          o.service_id,
          o.number_of_sessions,
          o.completed_sessions,
          c.full_name AS client_name,
          c.email AS client_email,
          sv.name AS service_title,
          sv.price AS service_price
        FROM appointments a
        JOIN orders o ON a.order_id = o.id
        LEFT JOIN clients c ON o.client_id = c.id
        LEFT JOIN services sv ON o.service_id = sv.id
        WHERE o.doctor_id = ?
        ORDER BY a.scheduled_at DESC
        LIMIT ? OFFSET ?`,
        [doctorId, limit, offset]
      );

      res.json({
        appointments,
        total: totalCount[0].count,
        page,
        totalPages: Math.ceil(totalCount[0].count / limit),
      });
    } catch (error) {
      console.error("Error in getAppointmentsByDoctorId:", error);
      res
        .status(500)
        .json({ message: "Server error while fetching doctor appointments" });
    }
  },
};

module.exports = appointmentController;
