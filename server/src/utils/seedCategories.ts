import { prisma } from '../lib/prisma.js';

const INITIAL_CATEGORIES = [
  {
    name: 'Electronics (ኤሌክትሮኒክስ)',
    slug: 'electronics',
    description: 'Phones, laptops, TVs, smartwatches, and electronics accessories',
  },
  {
    name: 'Agriculture & Teff (ግብርና እና ጤፍ)',
    slug: 'agriculture',
    description: 'Teff, grains, seeds, fertilizer, and agricultural equipment',
  },
  {
    name: 'Livestock & Animals (የከብት እርባታ)',
    slug: 'livestock',
    description: 'Cattle, sheep, goats, poultry, and farm animals',
  },
  {
    name: 'Fashion & Clothes (አልባሳት እና ጫማዎች)',
    slug: 'fashion',
    description: 'Men, women, and kids clothing, traditional wear, and shoes',
  },
  {
    name: 'Food & Groceries (ምግብ እና የሸቀጥ እቃዎች)',
    slug: 'food',
    description: 'Local food items, spices, butter, coffee, and daily groceries',
  },
  {
    name: 'Home & Living (የቤት እና የቢሮ እቃዎች)',
    slug: 'home-living',
    description: 'Furniture, kitchenware, bedding, and home decorations',
  },
  {
    name: 'Vehicles & Bajaj (መኪኖች እና ባጃጅ)',
    slug: 'vehicles',
    description: 'Cars, Bajaj, motorcycles, bicycles, and spare parts',
  },
  {
    name: 'Property & Land (ቤት እና መሬት)',
    slug: 'property',
    description: 'Houses for rent/sale, commercial shops, and farmland',
  },
  {
    name: 'Health & Beauty (የውበት እና የጤና መጠበቂያዎች)',
    slug: 'beauty',
    description: 'Cosmetics, skincare, perfumes, and personal care products',
  },
  {
    name: 'Services & Handcrafts (የእጅ ጥበብ እና አገልግሎቶች)',
    slug: 'services',
    description: 'Local artisan handcrafts, repair services, and professional work',
  },
];

async function main() {
  console.log('Seeding initial categories to database...');

  for (const cat of INITIAL_CATEGORIES) {
    const existing = await prisma.categories.findFirst({
      where: {
        OR: [{ slug: cat.slug }, { name: cat.name }],
      },
    });

    if (!existing) {
      await prisma.categories.create({
        data: cat,
      });
      console.log(`✓ Created category: ${cat.name}`);
    } else {
      console.log(`- Category already exists: ${cat.name}`);
    }
  }

  console.log('Category seeding completed successfully!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error seeding categories:', err);
  process.exit(1);
});
