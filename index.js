const WebSocket = require("ws");

// 创建一个 WebSocket 服务器，监听 8080 端口
const wss = new WebSocket.Server({ port: 3000 });
console.log('123')

console.log("WebSocket server started on ws://localhost:3000");

// 用来存储所有连接的客户端
const clients = new Map();

// 当有客户端连接时触发
wss.on("connection", (ws) => {
  console.log("New client connected");

  // 生成一个客户端 ID 并存储连接
  const clientId = generateClientId();
  clients.set(clientId, ws);

  // 发送欢迎消息和分配的客户端 ID
  ws.send(JSON.stringify({ type: "welcome", id: clientId }));

  // 处理接收到的消息
  ws.on("message", (message) => {
    console.log(`Received message from client ${clientId}: ${message}`);

    try {
      const parsedMessage = JSON.parse(message);

      // 检查消息是否指定了目标客户端
      const targetId = parsedMessage.targetId;
      const targetWs = clients.get(targetId);

      // 如果指定了目标客户端，转发消息
      if (targetWs && targetWs.readyState === WebSocket.OPEN) {
        console.log(`Forwarding message to client ${targetId}`);
        targetWs.send(
          JSON.stringify({
            ...parsedMessage,
            from: clientId,
          })
        );
      } else {
        console.error(`Client ${targetId} not connected or unavailable`);
      }
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  // 当连接关闭时移除客户端
  ws.on("close", () => {
    console.log(`Client ${clientId} disconnected`);
    clients.delete(clientId);
  });
});

// 生成唯一客户端 ID 的函数
function generateClientId() {
  return Math.random().toString(36).substring(2, 10);
}
