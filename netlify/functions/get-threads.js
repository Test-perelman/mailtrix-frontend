// Netlify serverless function to fetch thread history for a job
// GET /api/get-threads?job_id=JOB001

export async function handler(event, context) {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const jobId = event.queryStringParameters?.job_id;

    if (!jobId) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: 'Missing parameter',
          message: 'job_id query parameter is required'
        })
      };
    }

    console.log('Fetching threads for job:', jobId);

    // In a production setup, this would query Google Sheets via n8n
    // or a database to get the thread history.
    // For now, we return an empty array and let the frontend
    // fetch from n8n webhook or use cached localStorage data.

    // To implement actual thread fetching:
    // 1. Call n8n webhook that queries email_threads sheet
    // 2. Filter by job_id
    // 3. Return sorted messages

    const n8nThreadsUrl = process.env.N8N_GET_THREADS_URL;

    if (n8nThreadsUrl) {
      // Forward request to n8n
      const response = await fetch(`${n8nThreadsUrl}?job_id=${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.APPROVAL_API_KEY || ''
        }
      });

      if (response.ok) {
        const threads = await response.json();
        return {
          statusCode: 200,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status: 'success',
            job_id: jobId,
            threads: threads.messages || [],
            count: threads.messages?.length || 0
          })
        };
      }
    }

    // Fallback: return empty threads (frontend uses localStorage)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: 'success',
        job_id: jobId,
        threads: [],
        count: 0,
        message: 'No n8n endpoint configured. Using client-side storage.'
      })
    };
  } catch (error) {
    console.error('Error fetching threads:', error);
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
