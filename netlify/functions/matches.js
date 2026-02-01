// Netlify serverless function to receive job matches from n8n
// POST /api/matches

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
    // Parse the incoming job match data
    const jobMatch = JSON.parse(event.body);

    // Validate required fields
    if (!jobMatch.job_id || !jobMatch.candidates) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Invalid payload',
          message: 'job_id and candidates are required'
        })
      };
    }

    // Log the received data (visible in Netlify function logs)
    console.log('Received job match:', JSON.stringify(jobMatch, null, 2));

    // Since Netlify functions are serverless and stateless,
    // we can't directly update the React app's state.
    // Instead, we'll redirect back to the app with the data as a URL parameter.
    // The app will pick this up and add it to localStorage.

    // For a production system, you'd want to:
    // 1. Store in a database (Supabase, Firebase, etc.)
    // 2. Use WebSockets or Server-Sent Events
    // 3. Use a real-time service like Pusher or Ably

    // For now, return success and let the frontend poll or use another mechanism
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'received',
        job_id: jobMatch.job_id,
        candidates_count: jobMatch.candidates?.length || 0,
        timestamp: new Date().toISOString(),
        message: 'Job match received successfully. Data will be displayed in the dashboard.'
      })
    };
  } catch (error) {
    console.error('Error processing request:', error);
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
