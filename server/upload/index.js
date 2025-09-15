import express from "express";

const app = express();

const port = process.env.PORT || 3000;

app.use("/", (req, res) => {
  res.json({ status: "status from server updated " });
});

app.listen(port, () => {
  console.log(`Server Listening On PORT: ${port}`);
});
