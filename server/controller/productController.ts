import { Request, Response } from 'express';
import ProductModel, { ProductSide } from '../models/productModel';

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    email: string;
  };
}

const normalizeImageName = (value: string): string => {
  return String(value)
    .trim()
    .replace(/^[/\\]+/, '')
    .replace(/^uploads[/\\]+/, '');
};

const getUploadedImages = (
  req: Request
): Partial<Record<ProductSide, string>> => {
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;

  const images: Partial<Record<ProductSide, string>> = {};

  if (!files) return images;

  const sides: ProductSide[] = [
    'front',
    'back',
    'top',
    'bottom',
    'left',
    'right',
  ];

  for (const side of sides) {
    const file = files[side]?.[0];
    if (file) {
      images[side] = normalizeImageName(file.filename);
      console.log(`Uploaded ${side}:`, file.filename);
    }
  }

  return images;
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await ProductModel.getById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'ምርቱ አልተገኘም',
      });
    }

    const normalizedProduct = {
      ...product,
      image: product.image
        ? `/uploads/${normalizeImageName(product.image)}`
        : null,
      product_images: product.product_images.map((img: any) => ({
        ...img,
        image_url: img.image_url
          ? `/uploads/${normalizeImageName(img.image_url)}`
          : null,
      })),
    };

    return res.status(200).json(normalizedProduct);
  } catch (error: any) {
    console.error('GET PRODUCT BY ID ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: error?.message,
    });
  }
};

export const createProduct = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    console.log('CREATE PRODUCT STARTED');
    console.log('BODY:', req.body);
    console.log('USER:', req.user);
    console.log('FILES:', req.files);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please login first',
      });
    }

    // admin ወይም seller ይፍቀድ
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only sellers or admins can create products',
        role: req.user.role,
      });
    }

    const sellerId = Number(req.user.id);
    if (!Number.isInteger(sellerId) || sellerId <= 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid seller authentication',
      });
    }

    const { name, price, category_id, description, slug, image } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name is required',
      });
    }

    if (price === undefined || price === null || price === '') {
      return res.status(400).json({
        success: false,
        message: 'Product price is required',
      });
    }

    if (category_id === undefined || category_id === null || category_id === '') {
      return res.status(400).json({
        success: false,
        message: 'Category is required',
      });
    }

    const images = getUploadedImages(req);
    console.log('FINAL IMAGE DATA:', images);

    const productId = await ProductModel.create(
      {
        name: String(name).trim(),
        price,
        description: description ? String(description).trim() : '',
        category_id,
        seller_id: sellerId,
        slug: slug ? String(slug).trim() : undefined,
        image: image ? String(image) : undefined,
      },
      images
    );

    console.log('PRODUCT CREATED:', productId);

    return res.status(201).json({
      success: true,
      message: 'ምርቱ በተሳካ ሁኔታ ተመዝግቧል',
      productId,
      seller_id: sellerId,
    });
  } catch (error: any) {
    console.error('CREATE PRODUCT ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'ምርቱን መመዝገብ አልተቻለም',
      error: error?.message || 'Unknown error',
      code: error?.code || null,
    });
  }
};

export const updateProduct = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please login first',
      });
    }

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await ProductModel.getById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (
      req.user.role !== 'admin' &&
      Number(product.seller_id) !== Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own products',
      });
    }

    const images = getUploadedImages(req);

    const result = await ProductModel.update(id, req.body, images);

    return res.status(200).json({
      success: true,
      message: 'ምርቱ በተሳካ ሁኔታ ተሻሽሏል',
      data: result,
    });
  } catch (error: any) {
    console.error('UPDATE PRODUCT ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'ምርቱን ማሻሻል አልተቻለም',
      error: error?.message,
      code: error?.code || null,
    });
  }
};

export const deleteProduct = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Please login first',
      });
    }

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    const product = await ProductModel.getById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    if (
      req.user.role !== 'admin' &&
      Number(product.seller_id) !== Number(req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own products',
      });
    }

    await ProductModel.delete(id);

    return res.status(200).json({
      success: true,
      message: 'ምርቱ በተሳካ ሁኔታ ተሰርዟል',
    });
  } catch (error: any) {
    console.error('DELETE PRODUCT ERROR:', error);
    return res.status(500).json({
      success: false,
      message: 'ምርቱን ማጥፋት አልተቻለም',
      error: error?.message,
      code: error?.code || null,
    });
  }
};
