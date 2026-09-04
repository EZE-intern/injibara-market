import { useEffect, useState } from "react";
import { Folder } from "lucide-react";
import {
  createAdminCategory,
  getAdminCategories,
  updateAdminCategory,
  updateCategoryStatus,
  type AdminCategory,
  type CategoryTier,
  type CreateCategoryData,
} from "../../api/categoryAdminApi";

const emptyForm: CreateCategoryData = {
  name: "",
  name_am: "",
  slug: "",
  description: "",
  icon: "",
  tier: "TIER_2",
};

function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] =
  useState<AdminCategory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<CreateCategoryData>(emptyForm);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getAdminCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load categories.");
    } finally {
      setLoading(false);
    }
  };
  const handleEdit = (category: AdminCategory) => {
  setEditingCategory(category);

  setForm({
    name: category.name,
    name_am: category.name_am ?? "",
    slug: category.slug,
    description: category.description ?? "",
    icon: category.icon ?? "",
    tier: category.tier,
  });

  setError(null);
  setShowModal(true);
};

  useEffect(() => {
    loadCategories();
  }, []);

  const updateForm = (
    field: keyof CreateCategoryData,
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!form.name.trim()) {
    setError("English category name is required.");
    return;
  }

  if (!form.slug.trim()) {
    setError("Category slug is required.");
    return;
  }

  try {
    setSaving(true);
    setError(null);

    if (editingCategory) {
      const updatedCategory = await updateAdminCategory(
        editingCategory.id,
        {
          ...form,
          name: form.name.trim(),
          name_am: form.name_am?.trim(),
          slug: form.slug.trim().toLowerCase(),
          description: form.description?.trim(),
          icon: form.icon?.trim(),
        }
      );

      setCategories((current) =>
        current.map((category) =>
          category.id === updatedCategory.id
            ? updatedCategory
            : category
        )
      );
    } else {
      const newCategory = await createAdminCategory({
        ...form,
        name: form.name.trim(),
        name_am: form.name_am?.trim(),
        slug: form.slug.trim().toLowerCase(),
        description: form.description?.trim(),
        icon: form.icon?.trim(),
      });

      setCategories((current) => [
        newCategory,
        ...current,
      ]);
    }

    setForm(emptyForm);
    setEditingCategory(null);
    setShowModal(false);
  } catch (err) {
    console.error(err);
    setError(
      editingCategory
        ? "Unable to update category."
        : "Unable to create category."
    );
  } finally {
    setSaving(false);
  }
};

  const handleStatusToggle = async (category: AdminCategory) => {
    try {
      setError(null);

      const updatedCategory = await updateCategoryStatus(
        category.id,
        !category.is_active
      );

      setCategories((current) =>
        current.map((item) =>
          item.id === updatedCategory.id
            ? updatedCategory
            : item
        )
      );
    } catch (err) {
      console.error(err);
      setError("Unable to update category status.");
    }
  };

  const getTierClasses = (tier: CategoryTier) => {
    if (tier === "TIER_1") {
      return "bg-purple-50 text-purple-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Categories
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage marketplace categories and their contact rules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingCategory(null);
            setForm(emptyForm);
            setError(null);
            setShowModal(true);
          }}
          className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
        >
          Add Category
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Information */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-purple-50 p-4">
            <p className="text-sm font-semibold text-purple-800">
              Tier 1 — Admin Mediated
            </p>

            <p className="mt-1 text-sm leading-6 text-purple-700">
              High-value listings where buyers contact the
              administration instead of contacting sellers
              directly.
            </p>
          </div>

          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm font-semibold text-slate-800">
              Tier 2 — Direct Contact
            </p>

            <p className="mt-1 text-sm leading-6 text-gray-600">
              General marketplace listings where buyers can
              contact sellers directly.
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {loading ? (
          <div className="px-6 py-16 text-center">
            <p className="text-sm text-gray-500">
              Loading categories...
            </p>
          </div>
        ) : categories.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="text-sm font-semibold text-slate-900">
              No categories found
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Categories will appear here once they are available.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Slug
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Products
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Marketplace Rule
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Status
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-600">
                          {category.icon || <Folder className="h-5 w-5 text-gray-400" />}
                        </div>

                        <div>
                          <p className="font-semibold text-slate-900">
                            {category.name}
                          </p>

                          {category.name_am && (
                            <p className="mt-1 text-xs text-gray-500">
                              {category.name_am}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <code className="text-sm text-gray-600">
                        {category.slug}
                      </code>
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {category.product_count}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getTierClasses(
                          category.tier
                        )}`}
                      >
                        {category.tier === "TIER_1"
                          ? "Admin Mediated"
                          : "Direct Contact"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={
                          category.is_active
                            ? "text-sm font-medium text-green-700"
                            : "text-sm font-medium text-gray-500"
                        }
                      >
                        {category.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right space-x-3">
                      <button
                        type="button"
                        onClick={() => handleEdit(category)}
                        className="text-sm font-semibold text-slate-600 hover:text-slate-900"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleStatusToggle(category)
                        }
                        className="text-sm font-semibold text-purple-600 hover:text-purple-800"
                      >
                        {category.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="border-b border-gray-100 px-6 py-5">
              <h2 className="text-lg font-bold text-slate-900">
                {editingCategory ? "Edit Category" : "Add Category"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {editingCategory
                  ? "Update category information."
                  : "Create a new marketplace category."}
              </p>
            </div>

            <form
              onSubmit={handleSave}
              className="space-y-4 p-6"
            >
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  English Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    updateForm("name", e.target.value)
                  }
                  placeholder="Example: Electronics"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Amharic Name
                </label>

                <input
                  type="text"
                  value={form.name_am}
                  onChange={(e) =>
                    updateForm("name_am", e.target.value)
                  }
                  placeholder="የምድብ ስም"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Slug
                </label>

                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) =>
                    updateForm(
                      "slug",
                      e.target.value
                        .toLowerCase()
                        .replace(/\s+/g, "-")
                    )
                  }
                  placeholder="electronics"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    updateForm(
                      "description",
                      e.target.value
                    )
                  }
                  rows={3}
                  placeholder="Describe this category..."
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Icon
                </label>

                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) =>
                    updateForm("icon", e.target.value)
                  }
                  placeholder="Optional icon"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Marketplace Rule
                </label>

                <select
                  value={form.tier}
                  onChange={(e) =>
                    updateForm(
                      "tier",
                      e.target.value as CategoryTier
                    )
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-400"
                >
                  <option value="TIER_2">
                    Tier 2 — Direct Contact
                  </option>

                  <option value="TIER_1">
                    Tier 1 — Admin Mediated
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? (editingCategory ? "Saving..." : "Creating...")
                    : (editingCategory ? "Save Changes" : "Create Category")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategoriesPage;