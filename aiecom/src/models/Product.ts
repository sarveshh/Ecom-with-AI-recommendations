import mongoose from 'mongoose';

export interface IProduct {
  _id: string;
  name: string;
  price: number;
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

// Prevent model re-compilation during development
const Product = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
