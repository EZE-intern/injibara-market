import { Link } from "react-router-dom";
import { categories } from "./categoryData";

function CategoryGrid() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-16">

        {/* Section heading */}
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Explore
          </p>

          <h2 className="mt-2 text-3xl font-bold text-gray-900">
            Browse Categories
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Find what you need from local sellers in Injibara.
          </p>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className="group rounded-2xl border border-gray-200 bg-white p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg"
            >
              {/* Icon */}
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-2xl transition-colors group-hover:bg-brand-100">
                {category.icon}
              </div>

              {/* Name */}
              <h3 className="mt-4 font-semibold text-gray-900 transition-colors group-hover:text-brand-600">
                {category.name}
              </h3>

              {/* Description */}
              <p className="mt-2 text-xs leading-5 text-gray-500">
                {category.description}
              </p>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}

export default CategoryGrid;