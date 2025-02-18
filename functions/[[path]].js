export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // 处理根路径
  if (url.pathname === "/" || url.pathname === "/index.html") {
    const response = await fetch(new URL('../public/index.html', import.meta.url));
    return new Response(response.body, {
      headers: {
        'content-type': 'text/html;charset=UTF-8'
      }
    });
  }
  
  return new Response('Not Found', { status: 404 });
}
