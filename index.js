const express = require('express');
const cors = require('cors');
const app= express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.jafmx4t.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run(){
    try{
        const userCollection= client.db("UserDatabase").collection("users");
        // const user = {
        //     name: "testing"
        // }
        // const result = await userCollection.insertOne(user);
        // console.log(result);

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