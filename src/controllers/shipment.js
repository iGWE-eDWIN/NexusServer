const Shipment = require('../models/shipment');

// Get all shipments (admin only)
const getAllShipment = async (req, res) => {
  try {
    let { page = 1, limit = 10, status, search } = req.query;

    // Convert page and limit to integers
    page = parseInt(page);
    limit = Math.min(parseInt(limit), 100); // Optional cap on limit
    // const { page = 1, limit = 10, status, search } = req.query;

    // Base query
    const query = { isActive: true };
    // let query = { isActive: true };

    // Full-text search across key fields
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { trackingNumber: { $regex: search, $options: 'i' } },
        { 'sender.name': { $regex: search, $options: 'i' } },
        { 'receiver.name': { $regex: search, $options: 'i' } },
      ];
    }

    // Query and paginate
    const shipments = await Shipment.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Shipment.countDocuments(query);

    res.status(200).send({
      shipments,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error('Get shipments error:', error);
    res.status(500).send({ message: 'Server error' });
  }
};

// Get shipment by tracking number (public)
const getShipmentBytrackingNumber = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const shipment = await Shipment.findOne({
      trackingNumber: trackingNumber.toUpperCase(),
      isActive: true,
    });

    if (!shipment) {
      return res.status(404).send({ message: 'Shipment not found' });
    }

    res.send({ shipment });
  } catch (error) {
    console.error('Track shipment error:', error);
    res.status(500).send({ message: 'Server error' });
  }
};

// Create new shipment
const createshipment = async (req, res) => {
  try {
    const shipmentData = req.body;

    // Calculate estimated delivery based on service
    const deliveryDays = {
      express: 2,
      standard: 5,
      economy: 10,
    };

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(
      estimatedDelivery.getDate() + deliveryDays[shipmentData.service]
    );

    const shipment = new Shipment({
      ...shipmentData,
      estimatedDelivery,
      currentLocation: {
        city: shipmentData.sender.city,
        country: shipmentData.sender.country,
        coordinates: shipmentData.sender.coordinates,
      },
      trackingHistory: [
        {
          status: 'Package created',
          location: {
            city: shipmentData.sender.city,
            country: shipmentData.sender.country,
            coordinates: shipmentData.sender.coordinates,
          },
          description: 'Shipment created and ready for pickup',
        },
      ],
    });

    // console.log('Shipment just before saving:', shipment);

    await shipment.save();
    res.status(201).send({ shipment });
  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).send({ message: 'Server error' });
  }
};

// Update shipment (admin only)
const updateShipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, city, country, description, destination } = req.body;
    // console.log(req.body);

    const shipment = await Shipment.findOne({ trackingNumber: id });
    if (!shipment) {
      return res.status(404).send({ message: 'Shipment not found' });
    }

    // 1. Append to tracking history
    shipment.trackingHistory.push({
      status: status || shipment.status,
      location: {
        city: city || shipment.currentLocation.city,
        country: country || shipment.currentLocation.country,
        coordinates: {}, // Optional: skip coords for manual input
      },
      description:
        description || `Status updated to ${status || shipment.status}`,
      timestamp: new Date(),
    });

    // 2. Update current location
    shipment.currentLocation = {
      city,
      country,
      coordinates: {}, // Optional: leave blank if typing manually
    };

    // 3. Optionally update status
    if (status) {
      shipment.status = status;
    }

    // 4. Optionally update destination
    if (destination && destination.city && destination.country) {
      shipment.destination = {
        city: destination.city,
        country: destination.country,
        coordinates: {}, // Optional
      };
    }

    await shipment.save();

    res.send({ shipment });
  } catch (error) {
    console.error('Update shipment error:', error);
    res.status(500).send({ message: 'Server error' });
  }
};

// Delete shipment (admin only)
const deleteShipment = async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    const deleted = await Shipment.findOneAndDelete({ trackingNumber });
    if (!deleted) {
      return res.status(404).send({ error: 'Shipment not found' });
    }

    res.send({ message: 'Shipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting shipment:', error);
    res.status(500).send({ error: 'Failed to delete shipment' });
  }
};

module.exports = {
  getAllShipment,
  getShipmentBytrackingNumber,
  createshipment,
  updateShipment,
  deleteShipment,
};
