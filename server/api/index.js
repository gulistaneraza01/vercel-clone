import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import express from "express";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import s3client from "./config/s3client.js";
import cors from "cors";

dotenv.config();

const app = express();
const port = 8001;

app.use(cors({ origin: "*" }));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const ecsClient = new ECSClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

app.post("/newproject", async (req, res) => {
  try {
    console.log("called");
    const { githubURL } = req.body;
    const projectId = nanoid(5).toLowerCase();

    const command = new RunTaskCommand({
      cluster: process.env.ECS_CLUSTER,
      taskDefinition: process.env.ECS_TASKDEFINITION,
      launchType: "FARGATE",
      count: 1,
      networkConfiguration: {
        awsvpcConfiguration: {
          assignPublicIp: "ENABLED",
          subnets: [
            process.env.ECS_SUBNET_1,
            process.env.ECS_SUBNET_2,
            process.env.ECS_SUBNET_3,
          ],
          securityGroups: [process.env.ECS_SECURITYGRP],
        },
      },
      overrides: {
        containerOverrides: [
          {
            name: "builder-image",
            environment: [
              { name: "GITURL", value: githubURL },
              { name: "PROJECT_ID", value: projectId },
              {
                name: "AWS_ACCESS_KEY_ID",
                value: process.env.AWS_ACCESS_KEY_ID,
              },
              {
                name: "AWS_SECRET_ACCESS_KEY",
                value: process.env.AWS_SECRET_ACCESS_KEY,
              },
              { name: "AWS_REGION", value: process.env.AWS_REGION },
            ],
          },
        ],
      },
    });

    await ecsClient.send(command);
    console.log("last");

    res.json({
      status: "queue",
      data: { projectId, url: `http://${projectId}.localhost:8000/` },
    });
  } catch (error) {
    res.json({
      status: "false",
      errorMsg: error.message,
    });
  }
});

app.post("/isdeploy", async (req, res) => {
  try {
    const { projectId } = req.body;

    const command = new HeadObjectCommand({
      Bucket: "vercel-demo-clone",
      Key: `output/${projectId}/index.html`,
    });
    const data = await s3client.send(command);

    return res.json({ status: "done", success: true, data });
  } catch (error) {
    res
      .status(400)
      .json({ status: "error", success: false, err: error.message });
  }
});

app.listen(port, () => {
  console.log("server Listening on PORT:", port);
});
