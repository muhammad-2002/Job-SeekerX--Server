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

    app.get('/jobs',async(req,res)=>{
        const result = await jobCollection.find().toArray()
        res.send(result)
    })

    app.get('/jobs/:id',async(req,res)=>{
        const job = req.params.id
        const query = {_id:new ObjectId(job)}
        const result = await jobCollection.findOne(query)
      
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