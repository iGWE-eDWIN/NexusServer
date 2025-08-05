const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const {
  getAllShipment,
  getShipmentBytrackingNumber,
  createshipment,
  updateShipment,
  deleteShipment,
} = require('../controllers/shipment');

const router = new express.Router();

router.get('/shipments/get', auth, adminAuth, getAllShipment);

router.get('/shipments/track/:trackingNumber', getShipmentBytrackingNumber);

router.post('/shipments/create', createshipment);

router.put('/shipments/update/:id', auth, adminAuth, updateShipment);

router.delete(
  '/shipments/delete/:trackingNumber',
  auth,
  adminAuth,
  deleteShipment
);

module.exports = router;
