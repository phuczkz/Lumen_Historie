const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Admin only
router.get('/stats', auth.adminAuth, dashboardController.getDashboardStats);

// @route   GET /api/dashboard/activities
// @desc    Get recent activities
// @access  Admin only
router.get('/activities', auth.adminAuth, dashboardController.getRecentActivities);

// @route   GET /api/dashboard/schedule
// @desc    Get today's schedule
// @access  Admin only
router.get('/schedule', auth.adminAuth, dashboardController.getTodaySchedule);

// @route   GET /api/dashboard/revenue-chart
// @desc    Get weekly revenue chart data (Income vs Expense)
// @access  Admin only
router.get('/revenue-chart', auth.adminAuth, dashboardController.getRevenueChart);

// @route   GET /api/dashboard/monthly-revenue-chart
// @desc    Get monthly revenue chart data
// @access  Admin only
router.get('/monthly-revenue-chart', auth.adminAuth, dashboardController.getMonthlyRevenueChart);

// @route   GET /api/dashboard/appointments-distribution
// @desc    Get appointments status distribution
// @access  Admin only
router.get('/appointments-distribution', auth.adminAuth, dashboardController.getAppointmentsDistribution);

// @route   GET /api/dashboard/total-invoice-stats
// @desc    Get total invoice statistics with growth rate
// @access  Admin only
router.get('/total-invoice-stats', auth.adminAuth, dashboardController.getTotalInvoiceStats);

// @route   GET /api/dashboard/patient-overview-by-age
// @desc    Get patient overview by age stages
// @access  Admin only
router.get('/patient-overview-by-age', auth.adminAuth, dashboardController.getPatientOverviewByAge);

// @route   GET /api/dashboard/patient-overview-by-departments
// @desc    Get patient overview by departments
// @access  Admin only
router.get('/patient-overview-by-departments', auth.adminAuth, dashboardController.getPatientOverviewByDepartments);

// @route   GET /api/dashboard/payment-status-distribution
// @desc    Get payment status distribution
// @access  Admin only
router.get('/payment-status-distribution', auth.adminAuth, dashboardController.getPaymentStatusDistribution);

// @route   GET /api/dashboard/monthly-revenue-trend
// @desc    Get monthly revenue trend
// @access  Admin only
router.get('/monthly-revenue-trend', auth.adminAuth, dashboardController.getMonthlyRevenueTrend);

// @route   GET /api/dashboard/top-doctors-by-patients
// @desc    Get top doctors by patient count
// @access  Admin only
router.get('/top-doctors-by-patients', auth.adminAuth, dashboardController.getTopDoctorsByPatients);

// @route   GET /api/dashboard/service-ratings-overview
// @desc    Get service ratings overview
// @access  Admin only
router.get('/service-ratings-overview', auth.adminAuth, dashboardController.getServiceRatingsOverview);

module.exports = router;
