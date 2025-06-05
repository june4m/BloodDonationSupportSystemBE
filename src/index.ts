import express from 'express'
import DatabaseServices from '~/services/database.services';




const app = express();
const port = 3000
app.get('/user',async(req,res)=>{
    try{
        const users = await DatabaseServices.getAllMember()
        res.json(users);
    }catch(error){
        res.status(500).send('Error fetching users')
    }
})

app.listen(port ,()=>{
    console.log(`Server running on http://localhost:${port}`)
})