const express = require('express');
const app= express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jafmx4t.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT( req, res, next){
  const authHeader = req.headers.authorization;
  if(!authHeader){
    return res.status(401).send("unauthorized access")
  }
const token = authHeader.split(' ')[1];
jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function(err, decoded){
  if(err){
    return res.status(403).send({message: "forbidden access"})
  }
  req.decoded = decoded;
  next();
} )
}

async function run(){
    try{
        const userCollection= client.db("UserDatabase").collection("users");
        // app.post('/jwt',async (req,res) =>{
        //     const user = req.body;
        //     const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h"})
        //     res.send({token})
        // })

        app.get('/jwt', async(req, res) =>{
            const email = req.query.email;
            const query ={email: email};
            const user = await userCollection.findOne(query);
            if(user){
              const token = jwt.sign({email},process.env.ACCESS_TOKEN_SECRET ,{expiresIn: '1h'})
              return res.send({accessToken: token})
            }
            res.status(403).send({accessToken: ''})
          })


          app.get('/users' , verifyJWT, async (req,res) =>{
            const email =req.query.email;
            const decodedEmail = req.decoded.email;

            if(email !== decodedEmail){
              return res.status(403).send({message: "forbidden access"})
            }
            const query ={ email: email};
            const users = await userCollection.find(query).toArray();
            res.send(users)
          })

      
       app.post('/users',async (req,res) =>{
            const user = req.body;
            const result = await userCollection.insertOne(user);
            user.id=result.insertedId;
            res.send(user);
        }) 
    }
    finally{

    }
}
run().catch(err => console.log(err))


app.get('/',(req , res)=>{
    res.send("Server is running")
})

app.listen(port ,() =>{
    console.log(`Server running on ${port}`)
})