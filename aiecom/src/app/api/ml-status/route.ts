import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Forward to Python recommendation service
    const response = await fetch('http://localhost:5000/model-status', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Recommendation service error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error getting model status:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get model status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Trigger model retraining
    const response = await fetch('http://localhost:5000/retrain-models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`Recommendation service error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Model retraining triggered',
      data
    });

  } catch (error) {
    console.error('Error retraining models:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrain models',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
