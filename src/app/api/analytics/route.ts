import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import AnalyticsEvent from '@/models/AnalyticsEvent';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const startDate = startOfDay(subDays(new Date(), days));
    const endDate = endOfDay(new Date());

    // Get overview metrics
    const totalUsers = await AnalyticsEvent.distinct('userId', {
      timestamp: { $gte: startDate, $lte: endDate }
    }).then(users => users.length);

    const totalSessions = await AnalyticsEvent.distinct('sessionId', {
      timestamp: { $gte: startDate, $lte: endDate }
    }).then(sessions => sessions.length);

    const totalPageViews = await AnalyticsEvent.countDocuments({
      event: 'view',
      timestamp: { $gte: startDate, $lte: endDate }
    });

    const totalAddToCarts = await AnalyticsEvent.countDocuments({
      event: 'add_to_cart',
      timestamp: { $gte: startDate, $lte: endDate }
    });

    // Calculate revenue (sum of purchase values)
    const revenue = await AnalyticsEvent.aggregate([
      {
        $match: {
          event: 'purchase',
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$value' }
        }
      }
    ]);

    const totalRevenue = revenue[0]?.total || 0;

    // Daily analytics data
    const dailyData = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            event: '$event'
          },
          count: { $sum: 1 },
          value: { $sum: '$value' }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          events: {
            $push: {
              event: '$_id.event',
              count: '$count',
              value: '$value'
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Top products by views
    const topProducts = await AnalyticsEvent.aggregate([
      {
        $match: {
          event: 'view',
          productId: { $exists: true },
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$productId',
          views: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          productId: '$_id',
          views: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      },
      {
        $sort: { views: -1 }
      },
      {
        $limit: 10
      }
    ]);

    // Conversion funnel
    const funnelData = await AnalyticsEvent.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$event',
          count: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' }
        }
      },
      {
        $project: {
          event: '$_id',
          count: 1,
          uniqueUsers: { $size: '$uniqueUsers' }
        }
      }
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalSessions,
          totalPageViews,
          totalAddToCarts,
          totalRevenue,
          conversionRate: totalAddToCarts > 0 ? ((totalRevenue > 0 ? 1 : 0) / totalAddToCarts * 100).toFixed(2) : 0,
          averageSessionValue: totalSessions > 0 ? (totalRevenue / totalSessions).toFixed(2) : 0
        },
        dailyData,
        topProducts,
        funnelData,
        dateRange: {
          start: format(startDate, 'yyyy-MM-dd'),
          end: format(endDate, 'yyyy-MM-dd')
        }
      }
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectMongoDB();
    
    const data = await request.json();
    const {
      userId,
      event,
      productId,
      category,
      value = 0,
      metadata = {},
      sessionId
    } = data;

    if (!userId || !event || !sessionId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'userId, event, and sessionId are required'
        },
        { status: 400 }
      );
    }

    // Get additional request info
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0] : 
                     request.headers.get('x-real-ip') || 
                     request.ip || 
                     'unknown';

    const analyticsEvent = new AnalyticsEvent({
      userId,
      event,
      productId,
      category,
      value,
      metadata,
      sessionId,
      userAgent,
      ipAddress
    });

    await analyticsEvent.save();

    return NextResponse.json({
      success: true,
      message: 'Analytics event tracked successfully',
      eventId: analyticsEvent._id
    });

  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to track analytics event',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
