const express =require('express')
const dotenv = require('dotenv')
dotenv.config()
const cors =require('cors')
const port =process.env.PORT || 3000
const app = express()


//middleware
app.use(express.json())
app.use(cors())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.iwngqer.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    const database = client.db("JobSeekerX");
    const jobCollection = database.collection('Job_Catagories');
    const ApplyCollection = database.collection('Applyed-job');

    app.get('/jobs',async(req,res)=>{
        const result = await jobCollection.find().toArray()
        res.send(result)
    })
    // Assuming you already have the necessary imports and setup for Express and MongoDB

// Define the route to handle job applications
app.put('/jobs/:id/apply', async (req, res) => {
  const jobId = req.params.id;

  try {
    // Find the job by its ID
    const job = await jobCollection.findOne({ _id: ObjectId(jobId) });

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
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
    console.error('Error applying for job:', error);
    res.status(500).json({ error: 'Failed to apply for job' });
  }
 });
    app.get('/applied-job',async(req,res)=>{
        const result = await ApplyCollection.find().toArray()
        console.log(result)
        res.send(result)
    })
    
    app.get('/jobs/:id',async(req,res)=>{
        const job = req.params.id
        const query = {_id:new ObjectId(job)}
        const result = await jobCollection.findOne(query)
      
        res.send(result)
    })
app.post('/apply-job',async(req,res)=>{
  const job =req.body
  const result = await ApplyCollection.insertOne(job)
  res.send(result)

})
    app.post('/jobs',async(req,res)=>{
      const jobs =req.body
      console.log(jobs)
      const result = await jobCollection.insertOne(jobs)
      res.send(result)
    })
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
 
   
  }
}
run().catch(console.dir);




app.listen(port,()=>console.log(`listening port${port}`)) 