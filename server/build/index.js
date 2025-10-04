import path from "node:path";
import { fileURLToPath } from "node:url";
import { exec } from "node:child_process";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "./config/s3.client.js";
import fs from "node:fs";
import mime from "mime-types";

const projectId = process.env.PROJECT_ID;

function init() {
  console.log("strated building");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const outDir = path.join(__dirname, "output");

  const child = exec(`cd ${outDir} && npm install && npm run build`);

  child.stdout.on("data", (data) => {
    console.log("started building", data);
  });

  child.stdout.on("error", (data) => {
    console.log("data", data);
  });

  child.on("close", async (data) => {
    console.log("build completed");

    const curDir = path.join(__dirname, "output", "dist");
    const folderStuct = fs.readdirSync(curDir, { recursive: true });

    console.log(folderStuct);

    for (let file of folderStuct) {
      const filePath = path.join(curDir, file);

      if (fs.statSync(filePath).isDirectory()) continue;
      const data = `output/${projectId}/${file}`;
      console.log({ filePath, data });

      const command = new PutObjectCommand({
        Bucket: "vercel-demo-clone",
        Key: `output/${projectId}/${file}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(file) || "application/octet-stream",
      });

      await s3Client.send(command);
    }

    console.log("uploaded to s3");
  });
}

init();
