import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getProductById, updateProduct } from "../../api/productApi";
import { getCategories, createCategory, type Category } from "../../api/categoryApi";
import { notify } from "../../utils/notify";
import { getUser, isAuthenticated } from "../../utils/authStorage";

const SIDES = [
  { key: "front", label: "Front Angle (ፊት ለፊት)", required: true },
  { key: "back", label: "Back Angle (ጀርባ)", required: false },
  { key: "left", label: "Left Side (የግራ ጎን)", required: false },
  { key: "right", label: "Right Side (የቀኝ ጎን)", required: false },
  { key: "top", label: "Top Angle (የላይኛው ክፍል)", required: false },
  { key: "bottom", label: "Bottom Angle (የታችኛው ክፍል)", required: false },
] as const;

type SideKey = (typeof SIDES)[number]["key"];

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loadingProduct, setLoadingProduct] = useState(true);
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

  // Existing image URLs from the server
  const [existingImages, setExistingImages] = useState<
    Array<{ id: number; image_url: string; is_primary?: boolean; side_angle?: string | null }>
  >([]);

  // New replacement image files
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

  // Load product data
  useEffect(() => {
    if (!isAuthenticated()) {
      notify.error("Please sign in first.");
      navigate("/login");
      return;
    }

    const loadProduct = async () => {
      if (!id) return;
      try {
        setLoadingProduct(true);
        const data = await getProductById(id);
        if (!data) {
          setError("Product not found");
          return;
        }

        // Check ownership
        const currentUser = getUser();
        if (
          currentUser &&
          currentUser.role !== "admin" &&
          data.seller_id &&
          Number(data.seller_id) !== Number(currentUser.id)
        ) {
          notify.error("You can only edit your own products.");
          navigate("/seller/products");
          return;
        }

        setFormData({
          name: data.name || "",
          price: data.price !== undefined ? String(data.price) : "",
          discount_price: data.discount_price ? String(data.discount_price) : "",
          stock: data.stock !== undefined ? String(data.stock) : "1",
          category_id: data.category_id ? String(data.category_id) : "",
          description: data.description || "",
        });

        if (data.product_images && data.product_images.length > 0) {
          setExistingImages(
            data.product_images.map((img) => ({
              id: img.id,
              image_url: img.image_url,
              is_primary: img.is_primary ?? undefined,
              side_angle: img.side_angle,
            }))
          );
        } else if (data.image) {
          setExistingImages([{ id: 0, image_url: data.image, is_primary: true }]);
        }
      } catch (err) {
        console.error("Failed to load product detail:", err);
        setError("Failed to load product details.");
      } finally {
        setLoadingProduct(false);
      }
    };

    loadProduct();
  }, [id, navigate]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: SideKey) => {
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
      notify.warning("Please enter category name");
      return;
    }

    try {
      setCreatingCategory(true);
      const newCat = await createCategory(trimmed);
      if (newCat) {
        setCategories((prev) => [...prev, newCat]);
        setFormData((prev) => ({ ...prev, category_id: String(newCat.id) }));
        setIsCustomCategory(false);
        setCustomCategoryName("");
        notify.success(`Category "${newCat.name}" created successfully!`);
      }
    } catch (err: unknown) {
      console.error("Failed to create category:", err);
      notify.error("Failed to create category.");
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);

    let finalCategoryId = formData.category_id;

    if (isCustomCategory && customCategoryName.trim()) {
      try {
        setSubmitting(true);
        const created = await createCategory(customCategoryName.trim());
        if (created) {
          finalCategoryId = String(created.id);
        }
      } catch (err) {
        console.error("Custom category creation failed:", err);
      }
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

    // Append any newly selected image files
    SIDES.forEach(({ key }) => {
      const file = images[key];
      if (file) {
        payload.append("images", file);
      }
    });

    try {
      setSubmitting(true);
      await updateProduct(id, payload);
      notify.success("Product updated successfully!");
      navigate("/seller/products");
    } catch (err: unknown) {
      console.error("Product update failed:", err);
      let errMsg = "Failed to update product. Please check your inputs.";
      if (err && typeof err === "object" && "response" in err) {
        const axErr = err as { response?: { data?: { message?: string } } };
        if (axErr.response?.data?.message) {
          errMsg = axErr.response.data.message;
        }
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      setError(errMsg);
      notify.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingProduct) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <p className="mt-4 text-sm font-medium text-gray-600">
            Loading product information...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-brand-600 transition"
            >
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <span className="text-gray-300">/</span>
            <Link
              to="/seller/products"
              className="inline-flex items-center text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              &larr; My Products
            </Link>
          </div>
          <Link
            to={`/products/${id}`}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            View Live Listing &rarr;
          </Link>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-10">
          <div className="border-b border-gray-100 pb-5">
            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl">
              ምርት ማሻሻያ (Edit Product Listing)
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Update pricing, inventory, descriptions, or upload new photos for this item.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-8">
            {/* 1. Category Selection */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-gray-900">
                  1. የምርት ምድብ (Category) <span className="text-brand-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomCategory(!isCustomCategory)}
                  className="text-xs font-bold text-brand-600 hover:text-brand-800 cursor-pointer"
                >
                  {isCustomCategory ? "&larr; Select Existing Category" : "+ Add New Category"}
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
                  <option value="NEW_CUSTOM">+ አዲስ ምድብ ጨምር (Create New Category)...</option>
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
                    className="rounded-lg bg-brand-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 cursor-pointer"
                  >
                    {creatingCategory ? "Creating..." : "Create Category"}
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
                  min="0.01"
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
                  min="0.01"
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
                  min="0"
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

            {/* Existing Images Gallery */}
            {existingImages.length > 0 && (
              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-base font-bold text-gray-900">
                  አሁን ያሉ ፎቶዎች (Current Product Photos)
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  These photos are currently displayed on your listing. You can upload additional photos below.
                </p>
                <div className="mt-4 flex flex-wrap gap-4">
                  {existingImages.map((img, idx) => (
                    <div
                      key={img.id || idx}
                      className="relative h-24 w-24 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
                    >
                      <img
                        src={img.image_url}
                        alt="Product visual"
                        className="h-full w-full object-cover"
                      />
                      {img.is_primary && (
                        <span className="absolute top-1 left-1 rounded bg-brand-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Upload Additional Photos */}
            <div className="border-t border-gray-100 pt-6">
              <div className="mb-4">
                <h3 className="text-base font-bold text-gray-900">
                  7. አዲስ ፎቶዎችን ይጫኑ (Upload New / Additional Photos)
                </h3>
                <p className="text-xs text-gray-500">
                  Optional: Upload new high-resolution multi-angle photos to replace or add to your gallery.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {SIDES.map(({ key, label }) => (
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
                          className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white shadow hover:bg-red-700 cursor-pointer"
                          title="Remove image"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                          {key.toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center text-center cursor-pointer p-4 w-full h-full">
                        <svg
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="mt-2 text-xs font-semibold text-gray-800">
                          {label}
                        </span>
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
                className="flex-1 rounded-xl bg-brand-600 py-3.5 px-6 text-sm font-bold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {submitting ? "ማሻሻያው እየተመዘገበ ነው... (Saving...)" : "ለውጦቹን መዝግብ (Save Changes)"}
              </button>

              <Link
                to="/seller/products"
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
