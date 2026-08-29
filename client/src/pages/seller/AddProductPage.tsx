import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createProduct } from "../../api/productApi";
import { getCategories, createCategory, type Category } from "../../api/categoryApi";

const SIDES = [
  { key: "front", label: "Front Angle (ፊት ለፊት)", required: true },
  { key: "back", label: "Back Angle (ጀርባ)", required: false },
  { key: "left", label: "Left Side (የግራ ጎን)", required: false },
  { key: "right", label: "Right Side (የቀኝ ጎን)", required: false },
  { key: "top", label: "Top Angle (የላይኛው ክፍል)", required: false },
  { key: "bottom", label: "Bottom Angle (የታችኛው ክፍል)", required: false },
] as const;

type SideKey = (typeof SIDES)[number]["key"];

export default function AddProductPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom Category State
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discount_price: "",
    stock: "1",
    category_id: "",
    description: "",
  });

  const [images, setImages] = useState<Record<SideKey, File | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
    top: null,
    bottom: null,
  });

  const [previews, setPreviews] = useState<Record<SideKey, string | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
    top: null,
    bottom: null,
  });

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const cats = await getCategories();
      setCategories(cats);
      if (cats.length > 0 && !formData.category_id && !isCustomCategory) {
        setFormData((prev) => ({ ...prev, category_id: String(cats[0].id) }));
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "category_id") {
      if (value === "NEW_CUSTOM") {
        setIsCustomCategory(true);
        setFormData((prev) => ({ ...prev, category_id: "" }));
      } else {
        setIsCustomCategory(false);
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: SideKey
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setImages((prev) => ({ ...prev, [side]: file }));
      const previewUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [side]: previewUrl }));
    }
  };

  const handleRemoveImage = (side: SideKey) => {
    setImages((prev) => ({ ...prev, [side]: null }));
    setPreviews((prev) => {
      if (prev[side]) URL.revokeObjectURL(prev[side]!);
      return { ...prev, [side]: null };
    });
  };

  const handleCreateCustomCategory = async () => {
    const trimmed = customCategoryName.trim();
    if (!trimmed) {
      alert("እባክዎ የምድብ ስም ያስገቡ (Please enter category name)");
      return;
    }

    const token = localStorage.getItem("token") || undefined;
    try {
      setCreatingCategory(true);
      const newCat = await createCategory(trimmed, undefined, token);
      if (newCat) {
        setCategories((prev) => [...prev, newCat]);
        setFormData((prev) => ({ ...prev, category_id: String(newCat.id) }));
        setIsCustomCategory(false);
        setCustomCategoryName("");
        alert(`"${newCat.name}" ምድብ በተሳካ ሁኔታ ተፈጥሯል!`);
      }
    } catch (err: unknown) {
      console.error("Failed to create category:", err);
      alert("ምድብ መፍጠር አልተቻለም። እባክዎ እንደገና ይሞክሩ።");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = localStorage.getItem("token");
    if (!token) {
      alert("እባክዎ መጀመሪያ ይግቡ (Please login first)");
      navigate("/login");
      return;
    }

    let finalCategoryId = formData.category_id;

    // If user has typed a custom category but hasn't clicked create yet, create it now
    if (isCustomCategory && customCategoryName.trim()) {
      try {
        setSubmitting(true);
        const created = await createCategory(
          customCategoryName.trim(),
          undefined,
          token
        );
        if (created) {
          finalCategoryId = String(created.id);
        }
      } catch (err) {
        console.error("Custom category creation failed:", err);
      }
    }

    if (!images.front) {
      setError("የፊተኛው ፎቶ (Front Image) ማስገባት ግዴታ ነው");
      setSubmitting(false);
      return;
    }

    const payload = new FormData();
    payload.append("name", formData.name.trim());
    payload.append("price", formData.price.trim());
    if (formData.discount_price.trim()) {
      payload.append("discount_price", formData.discount_price.trim());
    }
    payload.append("stock", formData.stock.trim() || "1");
    if (finalCategoryId) {
      payload.append("category_id", finalCategoryId);
    }
    if (formData.description.trim()) {
      payload.append("description", formData.description.trim());
    }

    // Append 6-angle image files
    SIDES.forEach(({ key }) => {
      const file = images[key];
      if (file) {
        payload.append("images", file);
      }
    });

    try {
      setSubmitting(true);
      await createProduct(payload, token);
      alert("ምርቱ በተሳካ ሁኔታ ተመዝግቧል! (Product listed successfully!)");
      navigate("/seller/products");
    } catch (err: unknown) {
      console.error("Product submission failed:", err);
      const errMsg =
        err instanceof Error
          ? err.message
          : "ምርቱን መመዝገብ አልተቻለም። እባክዎ እንደገና ይሞክሩ።";
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/seller"
            className="inline-flex items-center text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            ← Back to Seller Dashboard
          </Link>
          <Link
            to="/products"
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            View Live Marketplace ↗
          </Link>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-10">
          <div className="border-b border-gray-100 pb-5">
            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              አዲስ ምርት መመዝገቢያ (Add New Product)
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Fill in product details and upload multi-angle photos for local buyers across Injibara.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* 1. Category Selection & Creation */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-gray-900">
                  1. የምርት ምድብ ይምረጡ ወይም አዲስ ይፍጠሩ (Category) <span className="text-brand-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-xs font-bold text-brand-600 hover:text-brand-800"
                >
                  {isCustomCategory ? "← ዝርዝሩን አሳይ (Show Dropdown)" : "+ አዲስ ምድብ ጨምር (Add New Category)"}
                </button>
              </div>

              {!isCustomCategory ? (
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="mt-3 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm font-medium text-gray-900 outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">-- ምድብ ይምረጡ (Select Category) --</option>
                  {loadingCategories ? (
                    <option disabled>Loading categories...</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                  <option value="NEW_CUSTOM">➕ + አዲስ ምድብ ጨምር (Create New Category)...</option>
                </select>
              ) : (
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customCategoryName}
                    onChange={(e) => setCustomCategoryName(e.target.value)}
                    placeholder="አዲስ የምድብ ስም ይጻፉ (e.g. Traditional Honey / የሀገር ባህል ማር)"
                    className="flex-1 rounded-lg border border-brand-300 bg-white p-3 text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                  />
                  <button
                    type="button"
                    disabled={creatingCategory}
                    onClick={handleCreateCustomCategory}
                    className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
                  >
                    {creatingCategory ? "እየፈጠረ ነው..." : "ምድቡን ፍጠር (Create)"}
                  </button>
                </div>
              )}
            </div>

            {/* 2. Basic Information Grid */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Product Name */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-900">
                  2. የምርት ስም (Product Name) <span className="text-brand-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="ምሳሌ፡ iPhone 14 Pro / ጤፍ 25 ኪ.ግ / Bajaj TVS"
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-900">
                  3. ዋጋ (Price in ETB) <span className="text-brand-600">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="ምሳሌ፡ 45000"
                  required
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              {/* Discount Price */}
              <div>
                <label className="block text-sm font-semibold text-gray-900">
                  4. የቅናሽ ዋጋ (Discount Price - Optional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="discount_price"
                  value={formData.discount_price}
                  onChange={handleInputChange}
                  placeholder="ምሳሌ፡ 42000"
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </div>

              {/* Available Stock */}
              <div>
                <label className="block text-sm font-semibold text-gray-900">
                  5. ያለ እቃ ብዛት (Stock Quantity)
                </label>
                <input
                  type="number"
                  min="1"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="1"
                  className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>

            {/* 3. Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900">
                6. ዝርዝር መግለጫ (Description)
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="ስለ እቃው ሁኔታ፣ ሞዴል፣ የዋስትና ጊዜ ወይም የማስረከቢያ ቦታ ዝርዝር መረጃ እዚህ ይጻፉ..."
                className="mt-2 w-full rounded-lg border border-gray-300 p-3 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {/* 4. Multi-angle 6-Side Image Uploads */}
            <div className="border-t border-gray-100 pt-6">
              <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900">
                  7. ባለ 6-አቅጣጫ የምርት ፎቶዎች (6-Angle Product Inspection Photos)
                </h3>
                <p className="text-xs text-gray-500">
                  የምርቱን ጥራት ለማሳየት ከተለያዩ አቅጣጫዎች የተነሱ ፎቶዎችን ይጫኑ። የፊተኛው ፎቶ (Front) ግዴታ ነው።
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {SIDES.map(({ key, label, required }) => (
                  <div
                    key={key}
                    className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition hover:border-brand-400 hover:bg-brand-50/20"
                  >
                    {previews[key] ? (
                      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-white shadow-sm">
                        <img
                          src={previews[key]!}
                          alt={`${key} preview`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(key)}
                          className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-xs text-white shadow hover:bg-red-700"
                          title="Remove image"
                        >
                          ✕
                        </button>
                        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                          {key.toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center text-center cursor-pointer p-4 w-full h-full">
                        <span className="text-2xl">📸</span>
                        <span className="mt-2 text-xs font-semibold text-gray-800">
                          {label}
                        </span>
                        {required && (
                          <span className="text-[10px] font-bold text-brand-600">
                            * ግዴታ (Required)
                          </span>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, key)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Actions */}
            <div className="flex gap-4 border-t border-gray-100 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-brand-600 py-3.5 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting
                  ? "ምርቱ እየተመዘገበ ነው... (Uploading to Cloudinary & Database...)"
                  : "ምርቱን መዝግብ (Register Product)"}
              </button>

              <Link
                to="/seller"
                className="rounded-xl border border-gray-300 py-3.5 px-6 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
