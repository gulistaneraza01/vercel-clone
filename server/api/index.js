import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import express from "express";
import { nanoid } from "nanoid";
import dotenv from "dotenv";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import s3client from "./config/s3client.js";

dotenv.config();

const app = express();
const port = 8001;

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
  const { githubURL } = req.body;
  const projectId = nanoid(5);

  //ecs setup
  // const command = new RunTaskCommand({
  //   cluster: "",
  //   taskDefinition: "",
  //   launchType: "FARGATE",
  //   count: 1,
  //   networkConfiguration: {
  //     awsvpcConfiguration: {
  //       assignPublicIp: "ENABLED",
  //       subnets: ["", "", ""],
  //       securityGroups: [""],
  //     },
  //   },
  //   overrides: {
  //     containerOverrides: [
  //       {
  //         name: "",
  //         environment: [
  //           { name: "GIT_REPOSITORY__URL", value: githubURL },
  //           { name: "PROJECT_ID", value: projectId },
  //         ],
  //       },
  //     ],
  //   },
  // });

  // await ecsClient.send(command);

  res.json({
    status: "queue",
    data: { projectId, url: `http://${projectId}.localhost:8000/` },
  });
});

app.get("/isdeploy", async (req, res) => {
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
