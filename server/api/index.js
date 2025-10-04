import { ECSClient, RunTaskCommand } from "@aws-sdk/client-ecs";
import express from "express";
import { nanoid } from "nanoid";

const app = express();

const port = 8001;

const ecsClient = new ECSClient({
  region: "ap-south-1",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
});

app.post("/newproject", async (req, res) => {
  const { githubURL } = req.body;
  const projectId = nanoid(5);

  //ecs setup
  const command = new RunTaskCommand({
    cluster: "",
    taskDefinition: "",
    launchType: "FARGATE",
    count: 1,
    networkConfiguration: {
      awsvpcConfiguration: {
        assignPublicIp: "ENABLED",
        subnets: ["", "", ""],
        securityGroups: [""],
      },
    },
    overrides: {
      containerOverrides: [
        {
          name: "",
          environment: [
            { name: "GIT_REPOSITORY__URL", value: githubURL },
            { name: "PROJECT_ID", value: projectId },
          ],
        },
      ],
    },
  });

  await ecsClient.send(command);

  res.json({
    status: "queue",
    data: { projectId, url: `http://${projectId}:8000/` },
  });
});

app.listen(port, () => {
  console.log("server Listening on PORT:", port);
});
