import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = Router();

// All admin routes require authentication and admin/super_admin role
router.use(protect, authorizeRoles('admin', 'super_admin'));

// 1. Overview Dashboard
router.get('/overview', adminController.getOverview);

// 2. Broker Hub
router.get('/broker-inquiries', adminController.getBrokerInquiries);
router.get('/broker-inquiries/:id', adminController.getBrokerInquiryById);
router.get('/broker-inquiries/:id/messages', adminController.getInquiryMessages);
router.post('/broker-inquiries/:id/messages', adminController.sendInquiryReply);
router.put('/broker-inquiries/:id/status', adminController.updateBrokerInquiryStatus);
router.put('/broker-inquiries/:id/appointment', adminController.setBrokerAppointment);

// 3. Products Moderation
router.get('/products', adminController.getProducts);
router.put('/products/:id/status', adminController.updateProductStatus);
router.put('/products/:id/reject', adminController.rejectProduct);
router.delete('/products/:id', adminController.deleteProduct);

// 4. Stores Directory & Moderation
router.get('/stores', adminController.getStores);
router.put('/stores/:id/status', adminController.updateStoreStatus);

// 5. Categories Management
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.put('/categories/:id/status', adminController.updateCategoryStatus);

// 6. User Management
router.get('/users', adminController.getUsers);
router.put('/users/:id/status', adminController.updateUserStatus);

// 7. Staff Admin Management
router.get('/management/admins', adminController.getStaffAdmins);
router.post('/management/admins', adminController.createStaffAdmin);
router.put('/management/admins/:id/status', adminController.updateStaffAdminStatus);

export default router;
