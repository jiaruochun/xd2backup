export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      
      if (url.pathname === '/api/chat') {
        const { onRequest } = await import('./functions/api/chat.js');
        return onRequest({ request, env });
      }
      
      // 默认返回 index.html
      return fetch(new Request(new URL('./index.html', request.url)));
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};
