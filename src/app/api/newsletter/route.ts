import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { EmailSubscriber, EmailCampaign, EmailEvent } from '@/models/EmailModels';

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { email, firstName, lastName, source = 'newsletter', preferences = {} } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if subscriber already exists
    const existingSubscriber = await EmailSubscriber.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      // Update existing subscriber if they were previously unsubscribed
      if (existingSubscriber.preferences.unsubscribed) {
        existingSubscriber.preferences.unsubscribed = false;
        existingSubscriber.isActive = true;
        existingSubscriber.preferences = { ...existingSubscriber.preferences, ...preferences };
        existingSubscriber.metadata.signupDate = new Date();
        
        await existingSubscriber.save();
        
        return NextResponse.json({
          success: true,
          message: 'Welcome back! You have been resubscribed to our newsletter.',
          subscriber: existingSubscriber
        });
      } else {
        return NextResponse.json(
          { success: false, message: 'Email is already subscribed' },
          { status: 409 }
        );
      }
    }

    // Create new subscriber
    const subscriber = new EmailSubscriber({
      email: email.toLowerCase(),
      firstName,
      lastName,
      source,
      preferences: {
        newsletter: true,
        promotions: true,
        productUpdates: false,
        unsubscribed: false,
        ...preferences
      }
    });

    await subscriber.save();

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to newsletter!',
      subscriber: {
        id: subscriber._id,
        email: subscriber.email,
        firstName: subscriber.firstName,
        lastName: subscriber.lastName
      }
    });

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Subscription failed. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || 'all';
    const source = searchParams.get('source');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};
    
    if (status === 'active') {
      filter.isActive = true;
      filter['preferences.unsubscribed'] = false;
    } else if (status === 'unsubscribed') {
      filter['preferences.unsubscribed'] = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    if (source) {
      filter.source = source;
    }

    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    // Get subscribers
    const subscribers = await EmailSubscriber
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Get total count
    const total = await EmailSubscriber.countDocuments(filter);

    // Get statistics
    const stats = await EmailSubscriber.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [
                { $and: [{ $eq: ['$isActive', true] }, { $eq: ['$preferences.unsubscribed', false] }] },
                1,
                0
              ]
            }
          },
          unsubscribed: { $sum: { $cond: [{ $eq: ['$preferences.unsubscribed', true] }, 1, 0] } }
        }
      }
    ]);

    const statistics = stats[0] || { total: 0, active: 0, unsubscribed: 0 };

    return NextResponse.json({
      success: true,
      data: {
        subscribers,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        },
        statistics
      }
    });

  } catch (error) {
    console.error('Get subscribers error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const subscriberId = searchParams.get('id');

    if (!email && !subscriberId) {
      return NextResponse.json(
        { success: false, message: 'Email or subscriber ID is required' },
        { status: 400 }
      );
    }

    const filter = email ? { email: email.toLowerCase() } : { _id: subscriberId };
    const subscriber = await EmailSubscriber.findOne(filter);

    if (!subscriber) {
      return NextResponse.json(
        { success: false, message: 'Subscriber not found' },
        { status: 404 }
      );
    }

    // Mark as unsubscribed instead of deleting
    subscriber.preferences.unsubscribed = true;
    subscriber.isActive = false;
    await subscriber.save();

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { success: false, message: 'Unsubscribe failed. Please try again later.' },
      { status: 500 }
    );
  }
}
