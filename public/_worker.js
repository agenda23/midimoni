export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Handle static assets
    if (url.pathname.startsWith('/assets/')) {
      const response = await env.ASSETS.fetch(request);
      return response;
    }
    
    // For all other routes, serve the SPA index.html
    const response = await env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
    
    // Add MIDI permissions headers
    const headers = new Headers(response.headers);
    headers.set('Permissions-Policy', 'midi=*');
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
};
