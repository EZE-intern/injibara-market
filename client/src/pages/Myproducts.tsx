import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function UploadImages() {
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

const [productData, setProductData] = useState({
  category_id: '',
  name: '',
  price: '',
  description: '',
});

  const [images, setImages] = useState<{ [key: string]: File | null }>({
    front: null,
    back: null,
    left: null,
    right: null,
    top: null,
    bottom: null,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: string) => {
    if (e.target.files && e.target.files[0]) {
      setImages((prev) => ({ ...prev, [side]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('እባክዎ መጀመሪያ Login ያድርጉ!');
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('category_id', Number(productData.category_id).toString());
    formData.append('name', productData.name);
    formData.append('price', Number(productData.price).toString());
    formData.append('description', productData.description);

    // የምስል ፋይሎችን ማያያዝ
    Object.keys(images).forEach((side) => {
      if (images[side]) {
        formData.append(side, images[side]!);
      }
    });

    setUploading(true);

    try {
      // Note: Content-Type explicitly ማስወገድ የተሻለ ነው (Axios ራሱ በ FormData ሰበብ Boundary አያይዞ ይልሰዋል)
      const response = await axios.post('http://localhost:5000/api/products', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Success:', response.data);
      alert('ምርቱ እና ምስሎቹ በተሳካ ሁኔታ ተመዝግበዋል!');
      navigate('/');
    } catch (err: any) {
      console.error('Upload Error:', err.response?.data || err.message);
      alert(`ምርቱን መመዝገብ አልተቻለም: ${err.response?.data?.message || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-4 my-8">
      <h2 className="text-xl font-bold text-gray-800 border-b pb-3">አዲስ ምርት መመዝገቢያ</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* 1. Category መምረጫ */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <label className="block text-sm font-semibold text-blue-900 mb-1">
            1. በመጀመሪያ የምርቱን ምድብ (Category) ይምረጡ *
          </label>
        <select
  name="category_id"
  value={productData.category_id}
  onChange={handleInputChange}
  className="w-full border border-blue-300 p-2.5 rounded-lg bg-white font-medium text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
  required
>
  <option value="">-- ምድብ ይምረጡ --</option>
  <option value="1">Electronics</option>
  <option value="2">Vehicles</option>
  <option value="3">Property</option>
  <option value="4">Fashion</option>
  <option value="5">Agriculture</option>
  <option value="6">Livestock</option>
  <option value="7">Home & Garden</option>
  <option value="8">Food & Beverages</option>
  <option value="9">Education</option>
  <option value="10">Services</option>
  <option value="11">Sports & Leisure</option>
  <option value="12">Business</option>
</select>
        </div>

        {/* 2. የምርት ስም */}
        <div>
          <label className="block text-sm font-medium text-gray-700">የምርት ስም (Product Name) *</label>
          <input
            type="text"
            name="name"
            required
            placeholder="ምሳሌ፡ iPhone 14 Pro / Toyota Vitz"
            value={productData.name}
            onChange={handleInputChange}
            className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* 3. ዋጋ */}
        <div>
          <label className="block text-sm font-medium text-gray-700">ዋጋ (Price in ETB) *</label>
          <input
            type="number"
            name="price"
            required
            placeholder="ምሳሌ፡ 45000"
            value={productData.price}
            onChange={handleInputChange}
            className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* 4. መግለጫ */}
        <div>
          <label className="block text-sm font-medium text-gray-700">መግለጫ (Description)</label>
          <textarea
            name="description"
            rows={3}
            placeholder="ስለ ምርቱ ዝርዝር መረጃ እዚህ ይጻፉ..."
            value={productData.description}
            onChange={handleInputChange}
            className="w-full border p-2 rounded mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* 5. የምርት ምስሎች መጫኛ */}
        <div className="space-y-3 border-t pt-4">
          <p className="font-semibold text-gray-700">የምርት ፎቶዎች (Upload Images)</p>
          {(['front', 'back', 'left', 'right', 'top', 'bottom'] as const).map((side, index) => (
            <div key={side}>
              <label className="block text-sm font-medium capitalize text-gray-600">
                {index + 1}. {side} Image {side === 'front' && '(ግዴታ / Required)'}
              </label>
              <input
                type="file"
                accept="image/*"
                required={side === 'front'}
                onChange={(e) => handleFileChange(e, side)}
                className="w-full border p-2 rounded mt-1 text-sm bg-gray-50"
              />
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading}
          className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 cursor-pointer"
        >
          {uploading ? 'እየተመዘገበ ነው...' : 'ምርቱን መዝግብ (Register Product)'}
        </button>
      </form>
    </div>
  );
}
