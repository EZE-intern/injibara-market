import { describe, it, expect } from 'vitest';
import { isBrokeredCategory } from '../src/utils/brokeredCategories.js';

describe('Tier 1 Brokered Category Routing Logic', () => {
  describe('Tier 1: Property & Land (Routes to Admin)', () => {
    it('should classify Property & Land category names and slugs as brokered', () => {
      expect(isBrokeredCategory('Property & Land (ቤት እና መሬት)', 'property')).toBe(true);
      expect(isBrokeredCategory('Property', 'property')).toBe(true);
      expect(isBrokeredCategory('Land for Sale', 'land')).toBe(true);
      expect(isBrokeredCategory('Real Estate', 'real-estate')).toBe(true);
      expect(isBrokeredCategory('Commercial Land', 'land')).toBe(true);
      expect(isBrokeredCategory('Agricultural Farmland', 'farmland')).toBe(true);
      expect(isBrokeredCategory('Residential Plots', 'plots')).toBe(true);
      expect(isBrokeredCategory('የከተማ መሬት', 'land')).toBe(true);
    });
  });

  describe('Tier 1: Vehicles & Transport (Routes to Admin)', () => {
    it('should classify Vehicles, Cars, Bajaj, and Transport as brokered', () => {
      expect(isBrokeredCategory('Vehicles & Bajaj (መኪኖች እና ባጃጅ)', 'vehicles')).toBe(true);
      expect(isBrokeredCategory('Vehicles & Transport', 'vehicles-transport')).toBe(true);
      expect(isBrokeredCategory('Vehicles', 'vehicles')).toBe(true);
      expect(isBrokeredCategory('Car', 'car')).toBe(true);
      expect(isBrokeredCategory('Cars', 'cars')).toBe(true);
      expect(isBrokeredCategory('Bajaj TVS', 'bajaj')).toBe(true);
      expect(isBrokeredCategory('Motorcycle', 'motorcycles')).toBe(true);
      expect(isBrokeredCategory('Commercial Trucks', 'trucks')).toBe(true);
      expect(isBrokeredCategory('የቤት መኪና', 'cars')).toBe(true);
    });
  });

  describe('Tier 1: Heavy Machinery & Construction Equipment (Routes to Admin)', () => {
    it('should classify Heavy Machinery, Large Equipment, and Construction Machinery as brokered', () => {
      expect(isBrokeredCategory('Heavy Machinery', 'heavy-machinery')).toBe(true);
      expect(isBrokeredCategory('Large Machinery', 'large-machinery')).toBe(true);
      expect(isBrokeredCategory('Machinery', 'machinery')).toBe(true);
      expect(isBrokeredCategory('Construction Materials', 'construction-materials')).toBe(true);
      expect(isBrokeredCategory('Construction Equipment', 'construction-equipment')).toBe(true);
      expect(isBrokeredCategory('Agricultural Tractor', 'tractor')).toBe(true);
      expect(isBrokeredCategory('Excavator / Bulldozer', 'excavator')).toBe(true);
      expect(isBrokeredCategory('የግንባታ ማሽነሪ', 'machinery')).toBe(true);
    });
  });

  describe('Standard Consumer Categories (Routes Directly to Seller)', () => {
    it('should NOT classify general consumer goods as brokered', () => {
      expect(isBrokeredCategory('Electronics (ኤሌክትሮኒክስ)', 'electronics')).toBe(false);
      expect(isBrokeredCategory('Agriculture & Teff (ግብርና እና ጤፍ)', 'agriculture')).toBe(false);
      expect(isBrokeredCategory('Livestock & Animals (የከብት እርባታ)', 'livestock')).toBe(false);
      expect(isBrokeredCategory('Fashion & Clothes (አልባሳት እና ጫማዎች)', 'fashion')).toBe(false);
      expect(isBrokeredCategory('Food & Groceries (ምግብ እና የሸቀጥ እቃዎች)', 'food')).toBe(false);
      expect(isBrokeredCategory('Home & Living (የቤት እና የቢሮ እቃዎች)', 'home-living')).toBe(false);
      expect(isBrokeredCategory('Health & Beauty (የውበት እና የጤና መጠበቂያዎች)', 'beauty')).toBe(false);
      expect(isBrokeredCategory('Personal Care', 'personal-care')).toBe(false);
      expect(isBrokeredCategory('Services & Handcrafts (የእጅ ጥበብ እና አገልግሎቶች)', 'services')).toBe(false);
      expect(isBrokeredCategory('Books & Education', 'books')).toBe(false);
    });

    it('should safely handle empty or null values', () => {
      expect(isBrokeredCategory(null, null)).toBe(false);
      expect(isBrokeredCategory('', '')).toBe(false);
      expect(isBrokeredCategory(undefined, undefined)).toBe(false);
    });
  });
});
