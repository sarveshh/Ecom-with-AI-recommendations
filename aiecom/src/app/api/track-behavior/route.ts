import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const { userId, action, productId, metadata } = body;
    
    if (!userId || !action || !productId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: userId, action, productId' 
        },
        { status: 400 }
      );
    }

    // Forward to Python recommendation service
    try {
      const response = await fetch('http://localhost:5000/track-behavior', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action,
          productId,
          metadata: metadata || {}
        }),
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });

      if (!response.ok) {
        throw new Error(`Recommendation service error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return NextResponse.json({
        success: true,
        message: 'Behavior tracked successfully',
        data
      });
    } catch (fetchError) {
      // If recommendation service is down, still return success but log the issue
      console.warn('Recommendation service unavailable:', fetchError);
      
      return NextResponse.json({
        success: true,
        message: 'Behavior logged (recommendation service offline)',
        warning: 'Recommendation service is not available'
      });
    }

  } catch (error) {
    console.error('Error tracking behavior:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to track behavior',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
