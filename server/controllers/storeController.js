const StoreModel = require('../models/storeModel');

// 1. አዲስ ሱቅ (Store) መፍጠር
const createStore = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { storeName, store_name, description, logo, phone, address } = req.body;

    // storeName ወይም store_name ተቀብሎ መስራት እንዲችል
    const nameOfStore = storeName || store_name;

    if (!nameOfStore) {
      return res.status(400).json({ message: 'እባክዎ የሱቅ ስም (storeName) ያስገቡ።' });
    }

    // ተጠቃሚው አስቀድሞ Store የከፈተ መሆኑን ማረጋገጥ
    const existingStore = await StoreModel.getByUserId(sellerId);
    if (existingStore) {
      return res.status(400).json({ message: 'አስቀድመው ሱቅ ፈጥረዋል። መረጃ ማስተካከል ይችላሉ።' });
    }

    // undefined የሆኑት መረጃዎች ወደ null እንዲቀየሩ ማድረግ (MySQL error እንዳይፈጠር)
    const finalDescription = description !== undefined ? description : null;
    const finalLogo = logo !== undefined ? logo : null;
    const finalPhone = phone !== undefined ? phone : null;
    const finalAddress = address !== undefined ? address : null;

    const storeId = await StoreModel.create(
      sellerId,
      nameOfStore,
      finalDescription,
      finalLogo,
      finalPhone,
      finalAddress
    );

    return res.status(201).json({
      message: 'ሱቅዎ በተሳካ ሁኔታ ተፈጥሯል!',
      storeId
    });
  } catch (error) {
    return res.status(500).json({ message: 'ሱቅ መፍጠር አልተቻለም።', error: error.message });
  }
};

// 2. የራሴን Store መረጃ ማምጣት (Seller Profile)
const getMyStore = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const store = await StoreModel.getByUserId(sellerId);

    if (!store) {
      return res.status(404).json({ message: 'እስካሁን የተመዘገበ ሱቅ የለዎትም።' });
    }

    return res.status(200).json(store);
  } catch (error) {
    return res.status(500).json({ message: 'የሱቅ መረጃ ማምጣት አልተቻለም።', error: error.message });
  }
};

// 3. ሁሉንም ሱቆች ማምጣት (ለደንበኞች)
const getAllStores = async (req, res) => {
  try {
    const stores = await StoreModel.getAll();
    return res.status(200).json(stores);
  } catch (error) {
    return res.status(500).json({ message: 'ሱቆችን ማምጣት አልተቻለም።', error: error.message });
  }
};

// 4. በ ID የልዩ Store መረጃ ማምጣት
const getStoreById = async (req, res) => {
  try {
    const { storeId } = req.params;
    const store = await StoreModel.getById(storeId);

    if (!store) {
      return res.status(404).json({ message: 'ሱቁ አልተገኘም።' });
    }

    return res.status(200).json(store);
  } catch (error) {
    return res.status(500).json({ message: 'የሱቅ መረጃ ማምጣት አልተቻለም።', error: error.message });
  }
};

// 5. የሱቅ መረጃ ማስተካከል
const updateStore = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { storeName, store_name, description, logo, phone, address } = req.body;

    const nameOfStore = storeName || store_name;

    const finalDescription = description !== undefined ? description : null;
    const finalLogo = logo !== undefined ? logo : null;
    const finalPhone = phone !== undefined ? phone : null;
    const finalAddress = address !== undefined ? address : null;

    const isUpdated = await StoreModel.update(
      sellerId,
      nameOfStore,
      finalDescription,
      finalLogo,
      finalPhone,
      finalAddress
    );

    if (!isUpdated) {
      return res.status(404).json({ message: 'ማስተካከል የሚፈልጉት ሱቅ አልተገኘም።' });
    }

    return res.status(200).json({ message: 'የሱቅ መረጃዎ ተስተካክሏል!' });
  } catch (error) {
    return res.status(500).json({ message: 'የሱቅ መረጃ ማስተካከል አልተቻለም።', error: error.message });
  }
};

// 6. ሱቅ ማጥፋት
const deleteStore = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const isDeleted = await StoreModel.remove(sellerId);

    if (!isDeleted) {
      return res.status(404).json({ message: 'የሚጠፋ ሱቅ አልተገኘም።' });
    }

    return res.status(200).json({ message: 'ሱቅዎ ተወግዷል!' });
  } catch (error) {
    return res.status(500).json({ message: 'ሱቅ ማጥፋት አልተቻለም።', error: error.message });
  }
};

module.exports = {
  createStore,
  getMyStore,
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore
};