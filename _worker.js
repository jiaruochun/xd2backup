export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      
      // 静态文件服务
      if (url.pathname === '/' || url.pathname === '/index.html') {
        const response = await fetch(new URL('./index.html', request.url));
        return new Response(response.body, {
          headers: {
            'content-type': 'text/html;charset=UTF-8',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // API 路由
      if (url.pathname === '/api/chat') {
        const { onRequest } = await import('./functions/api/chat.js');
        return onRequest({ request, env });
      }
      
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};
