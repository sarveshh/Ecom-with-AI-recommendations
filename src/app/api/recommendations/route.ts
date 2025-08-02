import { NextRequest, NextResponse } from 'next/server';

interface RecommendationRequest {
  userId: string;
  purchaseHistory?: string[];
  numRecommendations?: number;
}

interface RecommendationResponse {
  success: boolean;
  recommendations?: string[];
  error?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RecommendationRequest = await request.json();
    const { userId, purchaseHistory = [], numRecommendations = 5 } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing userId',
          message: 'userId is required',
        },
        { status: 400 }
      );
    }

    // Call the Python recommendation engine
    const recommendationApiUrl = process.env.RECOMMENDATION_API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${recommendationApiUrl}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        purchaseHistory,
        numRecommendations,
      }),
    });

    if (!response.ok) {
      throw new Error(`Recommendation service responded with status ${response.status}`);
    }

    const data: RecommendationResponse = await response.json();

    if (data.success) {
      return NextResponse.json({
        success: true,
        recommendations: data.recommendations,
        userId,
        numRecommendations: data.recommendations?.length || 0,
      });
    } else {
      throw new Error(data.message || 'Recommendation service returned an error');
    }

  } catch (error) {
    console.error('Error fetching recommendations:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recommendations',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const numRecommendations = parseInt(searchParams.get('numRecommendations') || '5');

  if (!userId) {
    return NextResponse.json(
      {
        success: false,
        error: 'Missing userId',
        message: 'userId is required as a query parameter',
      },
      { status: 400 }
    );
  }

  // Convert to POST request internally
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      purchaseHistory: [],
      numRecommendations,
    }),
  }));
}
