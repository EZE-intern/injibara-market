import { Hono } from 'hono';
import type { AppContext } from '../types/context.js';
import { adminController } from '../controllers/adminController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const app = new Hono<AppContext>();

// All admin routes require authentication and admin/super_admin role
app.use('*', protect, authorizeRoles('admin', 'super_admin'));

// 1. Overview Dashboard
app.get('/overview', adminController.getOverview);

// 2. Broker Hub
app.get('/broker-inquiries', adminController.getBrokerInquiries);
app.get('/broker-inquiries/:id', adminController.getBrokerInquiryById);
app.get('/broker-inquiries/:id/messages', adminController.getInquiryMessages);
app.post('/broker-inquiries/:id/messages', adminController.sendInquiryReply);
app.put('/broker-inquiries/:id/status', adminController.updateBrokerInquiryStatus);
app.put('/broker-inquiries/:id/appointment', adminController.setBrokerAppointment);

// 3. Products Moderation
app.get('/products', adminController.getProducts);
app.put('/products/:id/status', adminController.updateProductStatus);
app.put('/products/:id/reject', adminController.rejectProduct);
app.delete('/products/:id', adminController.deleteProduct);

// 4. Stores Directory & Moderation
app.get('/stores', adminController.getStores);
app.put('/stores/:id/status', adminController.updateStoreStatus);

// 5. Categories Management
app.get('/categories', adminController.getCategories);
app.post('/categories', adminController.createCategory);
app.put('/categories/:id', adminController.updateCategory);
app.put('/categories/:id/status', adminController.updateCategoryStatus);

// 6. User Management
app.get('/users', adminController.getUsers);
app.put('/users/:id/status', adminController.updateUserStatus);

// 7. Staff Admin Management
app.get('/management/admins', adminController.getStaffAdmins);
app.post('/management/admins', adminController.createStaffAdmin);
app.put('/management/admins/:id/status', adminController.updateStaffAdminStatus);

// 8. Admin Permissions
app.get('/my-permissions', adminController.getMyPermissions);
app.get('/permissions/:userId', adminController.getAdminPermissions);
app.put('/permissions/:userId', adminController.setAdminPermissions);

export default app;
