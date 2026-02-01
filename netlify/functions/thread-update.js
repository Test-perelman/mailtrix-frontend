// Netlify serverless function to receive thread updates from n8n
// POST /api/thread-update

export async function handler(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body);

    // Validate required fields
    if (!payload.job_id || !payload.message) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Invalid payload',
          message: 'job_id and message are required'
        })
      };
    }

    // Validate message structure
    const { message } = payload;
    if (!message.id || !message.direction || !message.body) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Invalid message structure',
          message: 'message must include id, direction, and body'
        })
      };
    }

    console.log('Received thread update:', JSON.stringify(payload, null, 2));

    // Return success - frontend polls or uses another mechanism
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'received',
        job_id: payload.job_id,
        message_id: message.id,
        direction: message.direction,
        thread_count: payload.thread_count || 1,
        unread_count: payload.unread_count || 0,
        timestamp: new Date().toISOString(),
        message: 'Thread update received successfully.'
      })
    };
  } catch (error) {
    console.error('Error processing thread update:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error.message
      })
    };
  }
}
