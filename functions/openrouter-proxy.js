export async function onRequestPost(context) {
  // context contains: request, env, params, waitUntil, next, data
  const { request, env } = context;

  try {
    // Get the original request body sent by the client
    const clientRequestBody = await request.json();

    // Construct the request to OpenRouter
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.OPENROUTER_KEY}`, // Secret key from Cloudflare environment
        'HTTP-Referer': request.headers.get('referer') || 'https://your-site.pages.dev', // Optional: Pass referer
        'X-Title': 'Prodigy Prophet' // Optional: Pass a title
      },
      body: JSON.stringify(clientRequestBody) // Pass through the client's request body
    });

    // Check for errors from OpenRouter
    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      console.error(`OpenRouter API Error (${openRouterResponse.status}): ${errorText}`);
      return new Response(errorText, {
        status: openRouterResponse.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Stream the response back to the client
    return new Response(openRouterResponse.body, {
      status: openRouterResponse.status,
      headers: {
        'Content-Type': 'application/json' // Assuming OpenRouter returns JSON
      }
    });

  } catch (error) {
    console.error('Error in Cloudflare Function:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error in proxy', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Optional: Handle GET requests or other methods if needed, e.g., for health checks
export async function onRequestGet(context) {
  return new Response('Prodigy Prophet OpenRouter Proxy is active. Use POST to make requests.', {
    status: 200,
    headers: { 'Content-Type': 'text/plain' }
  });
} 