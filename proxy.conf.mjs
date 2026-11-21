// Dev-server proxy: /api goes to the local API.
//
// The web server and the API start in parallel, and the API takes longer. Until it listens, every /api
// request would make the dev server log a proxy error. So the proxy checks the API's port once a second and,
// while nothing listens there, answers 503 itself instead of forwarding. The app sees "API is starting".
import net from 'node:net';

const target = process.env.API_PROXY_TARGET ?? 'http://localhost:3000';
const { hostname, port } = new URL(target);

let apiUp = false;
function probe() {
  const socket = net.connect({ host: hostname, port: Number(port) || 80 });
  socket.setTimeout(500);
  socket.once('connect', () => { apiUp = true; socket.destroy(); });
  socket.once('timeout', () => { apiUp = false; socket.destroy(); });
  socket.once('error', () => { apiUp = false; });
}
probe();
setInterval(probe, 1000).unref();

export default {
  '/api': {
    target,
    secure: false,
    ws: true,
    bypass(_request, response) {
      if (apiUp || !response) {
        return undefined; // forward to the API
      }
      response.statusCode = 503;
      response.setHeader('Content-Type', 'application/json');
      response.setHeader('Retry-After', '2');
      response.end('{"status":503,"error":"API is starting"}');
      return false;
    },
    // A WebSocket upgrade or a request caught mid-restart can still fail; one short line is enough.
    configure(proxy) {
      proxy.on('error', () => {});
    },
  },
};
