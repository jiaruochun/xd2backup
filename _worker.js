export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 处理 API 请求
    if (url.pathname === '/api/chat') {
      return await import('./functions/api/chat.js')
        .then(module => module.onRequest({ request, env }));
    }
    
    // 处理静态文件
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return fetch(new Request(new URL('./index.html', request.url)));
    }
    
    return new Response('Not Found', { status: 404 });
  },
};
