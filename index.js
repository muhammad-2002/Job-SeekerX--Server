const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const port = process.env.PORT || 3000;

const app = express();

//middleware
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://jobseekrex.web.app",
      "https://jobseekrex.firebaseapp.com",
    ],
    credentials: true,
  })
);

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iwngqer.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//my middleware
const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).send("unAuthorize");
  }
  jwt.verify(token, process.env.COOKIE_SERECT, (err, decoded) => {
    if (err) {
      console.log("kisser", err);
      res.status(401).send("unAuthorize");
    }
    req.user = decoded;
    next();
  });
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
};
app.use(cookieParser());

async function run() {
  try {
    const database = client.db("JobSeekerX");
    const jobCollection = database.collection("Job_Catagories");
    const ApplyCollection = database.collection("Applyed-job");

    app.get("/jobs", async (req, res) => {
      const result = await jobCollection.find().toArray();
      res.send(result);
    });
    // Assuming you already have the necessary imports and setup for Express and MongoDB

    // Define the route to handle job applications
    app.put("/jobs/:id/apply", async (req, res) => {
      const jobId = req.params.id;

      try {
        // Find the job by its ID
        const job = await jobCollection.findOne({ _id: ObjectId(jobId) });

        if (!job) {
          return res.status(404).json({ error: "Job not found" });
        }

        // Increment the applicants_number field by 1 using the $inc operator
        const updatedJob = await jobCollection.findOneAndUpdate(
          { _id: ObjectId(jobId) },
          { $inc: { applicants_number: 1 } },
          { returnOriginal: false }
        );

        // Return the updated job document
        res.json(updatedJob.value);
      } catch (error) {
        res.status(500).json({ error: "Failed to apply for job" });
      }
    });
    /// jwt implement
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.COOKIE_SERECT, {
        expiresIn: "1h",
      });
      res.cookie("token", token, cookieOptions).send({ status: true });
    });
    app.get("/logout", (req, res) => {
      const token = req.body.cookie;
      res
        .clearCookie("token", { ...cookieOptions, maxAge: 0 })
        .send({ status: true });
    });

    app.put("/update/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updateJob = req.body;
        const updateDoc = {
          $set: {
            ...updateJob,
          },
        };
        const result = await jobCollection.updateOne(
          filter,
          updateDoc,
          options
        );
        res.send(result);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });

    app.get("/applied-job", async (req, res) => {
      const result = await ApplyCollection.find().toArray();

      res.send(result);
    });

    app.get("/jobs/:id", async (req, res) => {
      const job = req.params.id;
      const query = { _id: new ObjectId(job) };
      const result = await jobCollection.findOne(query);

      res.send(result);
    });
    app.delete("/jobs/:id", (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = jobCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/my-jobs/:email", async (req, res) => {
      try {
        const email = req.params.email; 
        const query = { userEmail: email };
        const cursor = await jobCollection.find(query).toArray();
        res.send(cursor);
      } catch (error) {
        res.status(500).send("Internal Server Error");
      }
    });
    app.post("/apply-job", async (req, res) => {
      const job = req.body;
      const result = await ApplyCollection.insertOne(job);
      res.send(result);
    });
    app.patch("/apply-job", async (req, res) => {
      const job = req.body;
      const id = job._id
      console.log(job)
      const updatedJob = await jobCollection.updateOne(
        { _id: new ObjectId(id) },
        { $inc: { applicants_number: 1 } },
        { returnOriginal: false }
      );
      res.send(updatedJob)
     
      
    });
    app.post("/jobs", async (req, res) => {
      const jobs = req.body;
      const result = await jobCollection.insertOne(jobs);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => console.log(`listening port${port}`));
