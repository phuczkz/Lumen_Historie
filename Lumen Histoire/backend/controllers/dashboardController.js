const connection = require('../config/db');

const dashboardController = {
  // Get dashboard statistics
  getDashboardStats: async (req, res) => {
    try {
      // Get total revenue
      const [revenueResult] = await connection.promise().query(
        `SELECT COALESCE(SUM(amount), 0) as total_revenue
         FROM orders 
         WHERE payment_status = 'paid'`
      );

      // Get clients count
      const [clientsResult] = await connection.promise().query(
        `SELECT COUNT(*) as total_clients FROM clients WHERE status = 'active'`
      );

      // Get services count
      const [servicesResult] = await connection.promise().query(
        `SELECT COUNT(*) as total_services FROM services`
      );

      // Get appointments today
      const [appointmentsResult] = await connection.promise().query(
        `SELECT COUNT(*) as appointments_today 
         FROM appointments 
         WHERE DATE(scheduled_at) = CURDATE()`
      );

      // Get monthly revenue
      const [monthlyRevenueResult] = await connection.promise().query(
        `SELECT COALESCE(SUM(amount), 0) as monthly_revenue
         FROM orders 
         WHERE status = 'completed' 
         AND YEAR(created_at) = YEAR(CURDATE()) 
         AND MONTH(created_at) = MONTH(CURDATE())`
      );

      // Get appointments in progress count
      const [inProgressResult] = await connection.promise().query(
        `SELECT COUNT(*) as in_progress_count
         FROM orders 
         WHERE status = 'in_progress'`
      );

      const stats = {
        totalRevenue: revenueResult[0].total_revenue,
        totalClients: clientsResult[0].total_clients,
        totalServices: servicesResult[0].total_services,
        appointmentsToday: appointmentsResult[0].appointments_today,
        monthlyRevenue: monthlyRevenueResult[0].monthly_revenue,
        inProgressCount: inProgressResult[0].in_progress_count
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ message: 'Server error while fetching dashboard statistics' });
    }
  },

  // Get recent activities
  getRecentActivities: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 10;

      const query = `
        SELECT 
          'appointment' as type,
          a.id,
          a.scheduled_at as timestamp,
          a.status,
          c.full_name as client_name,
          d.full_name as doctor_name,
          s.name as service_name,
          a.created_at
        FROM appointments a
        JOIN orders o ON a.order_id = o.id
        JOIN clients c ON o.client_id = c.id
        JOIN doctors d ON o.doctor_id = d.id
        JOIN services s ON o.service_id = s.id
        WHERE a.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        
        UNION ALL
        
        SELECT 
          'payment' as type,
          o.id,
          o.paid_at as timestamp,
          o.payment_status as status,
          c.full_name as client_name,
          d.full_name as doctor_name,
          s.name as service_name,
          o.paid_at as created_at
        FROM orders o
        JOIN clients c ON o.client_id = c.id
        JOIN doctors d ON o.doctor_id = d.id
        JOIN services s ON o.service_id = s.id
        WHERE o.payment_status = 'paid' 
        AND o.paid_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        
        UNION ALL
        
        SELECT 
          'review' as type,
          r.id,
          a.scheduled_at as timestamp,
          'completed' as status,
          c.full_name as client_name,
          d.full_name as doctor_name,
          s.name as service_name,
          r.created_at
        FROM reviews r
        JOIN appointments a ON r.appointment_id = a.id
        JOIN orders o ON a.order_id = o.id
        JOIN clients c ON o.client_id = c.id
        JOIN doctors d ON o.doctor_id = d.id
        JOIN services s ON o.service_id = s.id
        WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        
        ORDER BY created_at DESC
        LIMIT ?
      `;

      const [activities] = await connection.promise().query(query, [limit]);
      res.json(activities);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      res.status(500).json({ message: 'Server error while fetching recent activities' });
    }
  },

  // Get today's schedule
  getTodaySchedule: async (req, res) => {
    try {
      const query = `
        SELECT 
          a.id,
          a.scheduled_at,
          a.status,
          a.session_number,
          c.full_name as client_name,
          d.full_name as doctor_name,
          s.name as service_name,
          da.start_time,
          da.end_time
        FROM appointments a
        JOIN orders o ON a.order_id = o.id
        JOIN clients c ON o.client_id = c.id
        JOIN doctors d ON o.doctor_id = d.id
        JOIN services s ON o.service_id = s.id
        LEFT JOIN doctor_availability da ON a.availability_id = da.id
        WHERE DATE(a.scheduled_at) = CURDATE()
        AND a.status IN ('confirmed', 'pending')
        ORDER BY a.scheduled_at ASC
      `;

      const [schedule] = await connection.promise().query(query);
      res.json(schedule);
    } catch (error) {
      console.error('Error fetching today schedule:', error);
      res.status(500).json({ message: 'Server error while fetching today schedule' });
    }
  },

  // Get monthly revenue chart data (last 6 months)
  getMonthlyRevenueChart: async (req, res) => {
    try {
      const query = `
        SELECT 
          DATE_FORMAT(paid_at, '%Y-%m') as month,
          SUM(amount) as revenue,
          COUNT(*) as orders_count
        FROM orders 
        WHERE payment_status = 'paid' 
        AND paid_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY DATE_FORMAT(paid_at, '%Y-%m')
        ORDER BY month ASC
      `;

      const [chartData] = await connection.promise().query(query);
      res.json(chartData);
    } catch (error) {
      console.error('Error fetching monthly revenue chart:', error);
      res.status(500).json({ message: 'Server error while fetching monthly revenue chart' });
    }
  },

  // Get appointments status distribution
  getAppointmentsDistribution: async (req, res) => {
    try {
      const query = `
        SELECT 
          status,
          COUNT(*) as count
        FROM appointments 
        WHERE scheduled_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY status
      `;

      const [distribution] = await connection.promise().query(query);
      res.json(distribution);
    } catch (error) {
      console.error('Error fetching appointments distribution:', error);
      res.status(500).json({ message: 'Server error while fetching appointments distribution' });
    }
  },

  // 1. Total Invoice stats
  getTotalInvoiceStats: async (req, res) => {
    try {
      // Get today's invoices
      const [todayResult] = await connection.promise().query(
        `SELECT COUNT(*) as today_count, COALESCE(SUM(amount), 0) as today_amount
         FROM orders 
         WHERE DATE(created_at) = CURDATE()`
      );

      // Get yesterday's invoices for comparison
      const [yesterdayResult] = await connection.promise().query(
        `SELECT COUNT(*) as yesterday_count, COALESCE(SUM(amount), 0) as yesterday_amount
         FROM orders 
         WHERE DATE(created_at) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`
      );

      // Total invoices
      const [totalResult] = await connection.promise().query(
        `SELECT COUNT(*) as total_count, COALESCE(SUM(amount), 0) as total_amount
         FROM orders`
      );

      const todayCount = todayResult[0].today_count;
      const yesterdayCount = yesterdayResult[0].yesterday_count;
      const growthRate = yesterdayCount > 0 ? ((todayCount - yesterdayCount) / yesterdayCount * 100) : (todayCount > 0 ? 100 : 0);

      res.json({
        totalInvoices: totalResult[0].total_count,
        totalAmount: totalResult[0].total_amount,
        todayInvoices: todayCount,
        yesterdayInvoices: yesterdayCount,
        growthRate: parseFloat(growthRate.toFixed(2))
      });
    } catch (error) {
      console.error('Error fetching total invoice stats:', error);
      res.status(500).json({ message: 'Server error while fetching total invoice stats' });
    }
  },

  // 2. Patient Overview by Age Stages (all time)
  // getPatientOverviewByAge: async (req, res) => {
  //   try {
  //     const query = `
  //       SELECT 
  //         DATE_FORMAT(a.scheduled_at, '%Y-%m') as month,
  //         CASE 
  //           WHEN c.birth_date IS NULL THEN 'Adult'
  //           WHEN TIMESTAMPDIFF(YEAR, c.birth_date, CURDATE()) < 18 THEN 'Child'
  //           WHEN TIMESTAMPDIFF(YEAR, c.birth_date, CURDATE()) BETWEEN 18 AND 64 THEN 'Adult'
  //           ELSE 'Elderly'
  //         END as age_group,
  //         COUNT(DISTINCT c.id) as patient_count
  //       FROM appointments a
  //       JOIN orders o ON a.order_id = o.id
  //       JOIN clients c ON o.client_id = c.id
  //       WHERE a.status IN ('confirmed', 'completed') -- chỉ tính lịch đã đặt thực sự
  //         AND a.scheduled_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
  //       GROUP BY DATE_FORMAT(a.scheduled_at, '%Y-%m'), age_group
  //       ORDER BY month ASC;
  //     `;

  //     const [data] = await connection.promise().query(query);
  //     res.json(data);
  //   } catch (error) {
  //     console.error('Error fetching patient overview by age group per month:', error);
  //     res.status(500).json({ message: 'Server error while fetching patient overview by age' });
  //   }
  // },
  // 2. Patient Overview by Age Stages (all time)
  getPatientOverviewByAge: async (req, res) => {
    try {
      const query = `
        SELECT 
  CASE 
    WHEN TIMESTAMPDIFF(YEAR, c.birth_date, CURDATE()) < 18 THEN 'Child'
    WHEN TIMESTAMPDIFF(YEAR, c.birth_date, CURDATE()) BETWEEN 18 AND 64 THEN 'Adult'
    ELSE 'Elderly'
  END AS age_group,
  COUNT(DISTINCT o.client_id) AS patient_count
FROM orders o
JOIN clients c ON o.client_id = c.id
WHERE DATE_FORMAT(o.created_at, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')
GROUP BY age_group;


      `;

      const [data] = await connection.promise().query(query);
      res.json(data);
    } catch (error) {
      console.error('Error fetching patient overview by age group per month:', error);
      res.status(500).json({ message: 'Server error while fetching patient overview by age' });
    }
  },


  
  // 3. Revenue chart (Income vs Expense) - all time by date
  getRevenueChart: async (req, res) => {
    try {
      const query = `
        SELECT 
          DAYNAME(created_at) as day_name,
          DATE(created_at) as date,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END), 0) as income,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN amount * 0.3 ELSE 0 END), 0) as expense
        FROM orders 
        GROUP BY DATE(created_at), DAYNAME(created_at)
        ORDER BY date ASC
      `;

      const [chartData] = await connection.promise().query(query);
      res.json(chartData);
    } catch (error) {
      console.error('Error fetching revenue chart:', error);
      res.status(500).json({ message: 'Server error while fetching revenue chart' });
    }
  },

  // 4. Patient Overview by Services (all time)
  getPatientOverviewByDepartments: async (req, res) => {
    try {
      // Use services-based categorization since no departments table
      const query = `
        SELECT 
          s.name as department,
          COUNT(DISTINCT c.id) as patient_count
        FROM orders o
        JOIN clients c ON o.client_id = c.id
        JOIN services s ON o.service_id = s.id
        GROUP BY s.id, s.name
        ORDER BY patient_count DESC
      `;
      
      const [data] = await connection.promise().query(query);
      
      // Get total patients
      const [totalResult] = await connection.promise().query(
        `SELECT COUNT(DISTINCT client_id) as total_patients FROM orders`
      );

      // Calculate percentages
      const totalPatients = totalResult[0].total_patients || data.reduce((sum, item) => sum + item.patient_count, 0);
      const departmentsWithPercentage = data.map(item => ({
        ...item,
        percentage: totalPatients > 0 ? parseFloat(((item.patient_count / totalPatients) * 100).toFixed(1)) : 0
      }));

      res.json({
        totalPatients: totalPatients,
        departments: departmentsWithPercentage
      });
    } catch (error) {
      console.error('Error fetching patient overview by services:', error);
      res.status(500).json({ message: 'Server error while fetching patient overview by services' });
    }
  },

  // 5. Payment Status Distribution
  getPaymentStatusDistribution: async (req, res) => {
    try {
      const query = `
        SELECT 
          payment_status,
          COUNT(*) as count,
          COALESCE(SUM(amount), 0) as total_amount
        FROM orders 
        GROUP BY payment_status
        ORDER BY count DESC
      `;

      const [data] = await connection.promise().query(query);
      
             // Calculate percentages
       const totalOrders = data.reduce((sum, item) => sum + Number(item.count), 0);
       const distributionWithPercentage = data.map(item => ({
         ...item,
         count: Number(item.count) || 0,
         total_amount: Number(item.total_amount) || 0,
         percentage: totalOrders > 0 ? parseFloat(((Number(item.count) / totalOrders) * 100).toFixed(1)) : 0
       }));

      res.json({
        totalOrders: totalOrders,
        distribution: distributionWithPercentage
      });
    } catch (error) {
      console.error('Error fetching payment status distribution:', error);
      res.status(500).json({ message: 'Server error while fetching payment status distribution' });
    }
  },

  // 6. Monthly Revenue Trend (last 12 months)
  getMonthlyRevenueTrend: async (req, res) => {
    try {
      const query = `
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m') as month,
          DATE_FORMAT(created_at, '%M %Y') as month_name,
          COUNT(*) as orders_count,
          COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END), 0) as revenue,
          COALESCE(SUM(amount), 0) as total_amount
        FROM orders 
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY DATE_FORMAT(created_at, '%Y-%m'), DATE_FORMAT(created_at, '%M %Y')
        ORDER BY month ASC
      `;

      const [data] = await connection.promise().query(query);
      
      // Format data to ensure proper number types
      const formattedData = data.map(item => ({
        ...item,
        orders_count: Number(item.orders_count) || 0,
        revenue: Number(item.revenue) || 0,
        total_amount: Number(item.total_amount) || 0
      }));
      
      res.json(formattedData);
    } catch (error) {
      console.error('Error fetching monthly revenue trend:', error);
      res.status(500).json({ message: 'Server error while fetching monthly revenue trend' });
    }
  },

  // 7. Top Doctors by Patient Count
  getTopDoctorsByPatients: async (req, res) => {
    try {
      const query = `
        SELECT 
          d.id,
          d.full_name as doctor_name,
          d.specialty,
          COUNT(DISTINCT o.client_id) as patient_count,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(CASE WHEN o.payment_status = 'paid' THEN o.amount ELSE 0 END), 0) as total_revenue
        FROM doctors d
        JOIN orders o ON d.id = o.doctor_id
        WHERE d.status = 'active'
        GROUP BY d.id, d.full_name, d.specialty
        ORDER BY patient_count DESC
        LIMIT 10
      `;

      const [data] = await connection.promise().query(query);
      
      // Format data to ensure proper number types
      const formattedData = data.map(item => ({
        ...item,
        patient_count: Number(item.patient_count) || 0,
        total_orders: Number(item.total_orders) || 0,
        total_revenue: Number(item.total_revenue) || 0
      }));
      
      res.json(formattedData);
    } catch (error) {
      console.error('Error fetching top doctors by patients:', error);
      res.status(500).json({ message: 'Server error while fetching top doctors by patients' });
    }
  },

  // 8. Service Ratings Overview
  getServiceRatingsOverview: async (req, res) => {
    try {
      const query = `
        SELECT 
          s.id,
          s.name as service_name,
          COALESCE(s.price, 0) as price,
          COUNT(r.id) as total_reviews,
          COALESCE(ROUND(AVG(r.rating), 1), 0.0) as average_rating,
          COUNT(DISTINCT o.client_id) as total_patients
        FROM services s
        LEFT JOIN orders o ON s.id = o.service_id
        LEFT JOIN appointments a ON o.id = a.order_id
        LEFT JOIN reviews r ON a.id = r.appointment_id
        GROUP BY s.id, s.name, s.price
        ORDER BY average_rating DESC, total_reviews DESC
      `;

      const [data] = await connection.promise().query(query);
      
      // Convert to proper data types
      const formattedData = data.map(item => ({
        ...item,
        average_rating: Number(item.average_rating) || 0,
        price: Number(item.price) || 0,
        total_reviews: Number(item.total_reviews) || 0,
        total_patients: Number(item.total_patients) || 0
      }));

      res.json(formattedData);
    } catch (error) {
      console.error('Error fetching service ratings overview:', error);
      res.status(500).json({ message: 'Server error while fetching service ratings overview' });
    }
  }
};

module.exports = dashboardController;
