export async function onRequest(context) {
  // 设置 CORS 和 SSE headers
  const headers = {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };

  // 处理 OPTIONS 请求
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  // 只允许 POST 请求
  if (context.request.method !== "POST") {
    return new Response(
      `data: ${JSON.stringify({ error: "仅支持 POST 请求" })}\n\n`,
      { headers }
    );
  }

  try {
    const body = await context.request.json();
    const { message, session_id } = body;

    if (!message) {
      return new Response(
        `data: ${JSON.stringify({ error: "消息不能为空" })}\n\n`,
        { headers }
      );
    }

    // 从环境变量获取凭证
    const API_KEY = context.env.API_KEY;
    const APP_ID = context.env.APP_ID;

    if (!API_KEY?.trim() || !APP_ID?.trim()) {
      return new Response(
        `data: ${JSON.stringify({ error: "服务器环境变量缺失" })}\n\n`,
        { headers }
      );
    }

    const API_URL = `https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`;
    const requestBody = {
      input: { prompt: message },
      parameters: {
        'incremental_output': true
      },
      debug: {}
    };

    if (session_id) {
      requestBody.input.session_id = session_id;
    }

    // 创建 Transform Stream 来处理响应
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // 发起请求到 DashScope API
    fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-SSE': 'enable'
      },
      body: JSON.stringify(requestBody)
    }).then(async response => {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        writer.write(value);
      }
      writer.close();
    }).catch(async error => {
      await writer.write(new TextEncoder().encode(
        `data: ${JSON.stringify({ error: "服务器错误" })}\n\n`
      ));
      writer.close();
    });

    return new Response(stream.readable, { headers });

  } catch (error) {
    return new Response(
      `data: ${JSON.stringify({ error: "服务器错误" })}\n\n`,
      { headers }
    );
  }
}
