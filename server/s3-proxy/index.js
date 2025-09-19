import express from "express";
import httpProxy from "http-proxy";

const app = express();
const proxy = httpProxy.createProxyServer();

const port = 8000;

const BASE_URL = `http://localhost:4566/verceldemo`;

app.use((req, res) => {
  const projectId = req.hostname.split(".")[0];

  console.log(projectId);
  proxy.web(req, res, {
    target: `${BASE_URL}/${projectId}`,
    changeOrigin: true,
  });
});

proxy.on("proxyReq", (proxyReq, req, res) => {
  const url = req.url;
  if (url === "/") proxyReq.path += "index.html";
});

app.listen(port, () => {
  console.log("Server Listening on PORT:", port);
});
