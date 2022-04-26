const express = require('express');
const cors = require('cors');
const jwt = require('jsonWebToken');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require('dotenv').config()
const app=express()
const port=process.env.PORT || 5000

const corsConfig={
  origin:true,
  credentials:true,
};
app.use(cors(corsConfig))
app.options('*',cors(corsConfig))

//middleware
app.use(cors())
app.use(express.json())

function verifyJwt(req,res,next){
  const authHeader = req.headers?.authorization;
  if(!authHeader){
    return res.status(401).send({message:'unauthorized access'})
  }
  const token=authHeader.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h8j8q.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
    try {
        await client.connect();
        const servicesCollection = client.db("geniusCar").collection("services");
        const orderCollection=client.db("geniusCar").collection("order")
    app.get('/services',async(req,res)=>{
        const query = {};
        const cursor = servicesCollection.find(query);
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/services/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id:ObjectId(id)}
      const result=await servicesCollection.findOne(query)
      res.send(result)
    })

    app.delete('/services/:id',async(req,res)=>{
      const id=req.params.id
      const query={_id:ObjectId(id)}
      const result=await servicesCollection.deleteOne(query)
      res.send(result)
    })

    app.post('/services',async(req,res)=>{
      const newService=req.body
      const result= await servicesCollection.insertOne(newService)
      res.send(result)
    })

    app.post('/login',async(req,res)=>{
      const user=req.body
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1d'});
      res.send({accessToken})
    })

    app.get('/order',verifyJwt,async(req,res)=>{
      const decodedEmail=req.decoded?.email
      const email=req.query?.email
      if(email===decodedEmail){
        const query = { email };
        const cursor = orderCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      }else{
        res.status(403).send({ message: "forbidden access" });
      }
      
    })

    app.post('/order',async(req,res)=>{
      const order=req.body
      const result = await orderCollection.insertOne(order)
      res.send(result)
    })
    
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get('/',(req,res)=>{
  res.send('welcome to genius car server ')
})

app.listen(port,()=>{
    console.log('listening to port',port);
})