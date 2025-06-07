export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Try to get the asset first
    try {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) {
        return asset;
      }
    } catch (e) {
      // Asset not found, continue to SPA fallback
    }
    
    // For SPA routing, return index.html for all non-asset requests
    if (!url.pathname.includes('.')) {
      try {
        const indexRequest = new Request(new URL('/index.html', request.url), request);
        const indexResponse = await env.ASSETS.fetch(indexRequest);
        
        // Add MIDI permissions headers
        const response = new Response(indexResponse.body, {
          status: indexResponse.status,
          statusText: indexResponse.statusText,
          headers: {
            ...Object.fromEntries(indexResponse.headers),
            'Permissions-Policy': 'midi=*',
            'Feature-Policy': 'midi *',
          },
        });
        
        return response;
      } catch (e) {
        return new Response('Not Found', { status: 404 });
      }
    }
    
    return new Response('Not Found', { status: 404 });
  },
}; 