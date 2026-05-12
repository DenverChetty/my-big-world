export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/__/auth')) {
      const firebaseUrl = `https://my-big-world-79980.firebaseapp.com${url.pathname}${url.search}`;
      const proxyRequest = new Request(firebaseUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      return fetch(proxyRequest);
    }
    
    return new Response('Not Found', { status: 404 });
  }
}
