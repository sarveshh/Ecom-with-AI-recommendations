import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextRequest, NextResponse } from 'next/server';

const sampleProducts = [
  {
    name: 'Wireless Bluetooth Headphones',
    price: 89.99,
    description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
    imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop',
    category: 'electronics',
    brand: 'AudioTech',
    tags: ['wireless', 'audio', 'noise-cancellation']
  },
  {
    name: 'Smart Watch Series 5',
    price: 299.99,
    description: 'Advanced smartwatch with health monitoring, GPS, and water resistance.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop',
    category: 'wearables',
    brand: 'TechWear',
    tags: ['smartwatch', 'fitness', 'gps']
  },
  {
    name: 'Portable USB-C Charger',
    price: 24.99,
    description: 'Fast-charging portable battery pack with multiple device compatibility.',
    imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400&h=400&fit=crop',
    category: 'accessories',
    brand: 'PowerPlus',
    tags: ['charger', 'portable', 'usb-c']
  },
  {
    name: 'Wireless Gaming Mouse',
    price: 79.99,
    description: 'Precision gaming mouse with customizable RGB lighting and programmable buttons.',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    category: 'gaming',
    brand: 'GamePro',
    tags: ['gaming', 'mouse', 'rgb']
  },
  {
    name: 'Mechanical Keyboard',
    price: 149.99,
    description: 'Professional mechanical keyboard with tactile switches and RGB backlighting.',
    imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop',
    category: 'gaming',
    brand: 'KeyMaster',
    tags: ['keyboard', 'mechanical', 'rgb']
  },
  {
    name: '4K Webcam',
    price: 199.99,
    description: 'Ultra HD webcam with auto-focus and built-in microphone for streaming.',
    imageUrl: 'https://images.unsplash.com/photo-1587826080692-8e21e6beb8b6?w=400&h=400&fit=crop',
    category: 'electronics',
    brand: 'StreamCam',
    tags: ['webcam', '4k', 'streaming']
  },
  {
    name: 'Laptop Stand',
    price: 34.99,
    description: 'Adjustable aluminum laptop stand for better ergonomics and cooling.',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop',
    category: 'accessories',
    brand: 'ErgoDesk',
    tags: ['laptop', 'stand', 'ergonomic']
  },
  {
    name: 'Blue Light Glasses',
    price: 29.99,
    description: 'Computer glasses that filter blue light to reduce eye strain.',
    imageUrl: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=400&fit=crop',
    category: 'health',
    brand: 'VisionCare',
    tags: ['glasses', 'blue-light', 'eye-protection']
  },
];

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Insert sample products
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`Inserted ${insertedProducts.length} products`);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded database with ${insertedProducts.length} products`,
      products: insertedProducts.map(p => ({ id: p._id, name: p.name }))
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed database',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
