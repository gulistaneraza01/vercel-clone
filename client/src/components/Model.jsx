import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const newProjectURL = "http://localhost:8001/newproject";
const isDeployedURL = "http://localhost:8001/isdeploy";

function Model() {
  const [githubUrl, setGithubUrl] = useState("");
  const [link, setLink] = useState("");
  const [projectId, setProjectId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedToS3, setUploadedToS3] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  async function isDeployed() {
    try {
      const { data } = await axios.post(isDeployedURL, { projectId });

      if (data.success) {
        toast.success("Successfully deployed ✅");
        setUploadedToS3(true);
      }
    } catch (error) {
      console.error("Deployment check failed:", error);
    }
  }

  useEffect(() => {
    if (!uploadedToS3 && projectId) {
      setIsPolling(true);
      const intervalId = setInterval(() => {
        isDeployed();
      }, 3000);

      return () => {
        setIsPolling(false);
        clearInterval(intervalId);
      };
    }
  }, [uploadedToS3, projectId]);

  async function handleSubmit(e) {
    e.preventDefault();

    if (githubUrl.trim().length == 0) {
      toast.error("Field is Empty!!");
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await axios.post(newProjectURL, {
        githubURL: githubUrl,
      });
      setLink(data.data.url);
      setProjectId(data.data.projectId);

      toast.success("Sucessfully Added In Queue deployed");
    } catch (error) {
      const errMsg = error.message || "Wrong Github URL";
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="shadow-md shadow-gray-400 rounded-xl p-8">
        <h2 className="text-black text-3xl font-bold">
          Deploy your GitHub Repository
        </h2>
        <p className="text-gray-500 mt-3 text-lg">
          Enter ths URL of your GitHub repostery to depoy it
        </p>
        <form className="my-7 text-lg" onSubmit={handleSubmit}>
          <label htmlFor="github" className="font-semibold">
            GitHub Repository URL
          </label>
          <br />
          <input
            type="text"
            name="github"
            id="github"
            placeholder="https://github.com/username/project-name"
            autoComplete="off"
            className="border-2 border-gray-600 rounded-lg w-full outline-none my-4 p-2 text-gray-700"
            value={githubUrl}
            onChange={(e) => {
              setGithubUrl(e.target.value);
            }}
          />
          <br />
          <input
            type="submit"
            disabled={isPolling || isLoading}
            value={isLoading || isPolling ? "Deploying...." : "Deploy"}
            className="rounded-lg w-full outline-none p-2 bg-gray-500 hover:bg-gray-600 text-gray-100"
          />
        </form>
        {uploadedToS3 && (
          <a className="text-lg text-gray-700">
            Live Preview: <span className="text-blue-500">{link}</span>
          </a>
        )}
      </div>
    </div>
  );
}

export default Model;
