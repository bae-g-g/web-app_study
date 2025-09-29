const express = require("express");
const {pool} = require("./DB/db.js");

const app = express();

const PORT = 8080;

app.use(express.json());


app.get("/", (req, res) => {
        return res.json({
        test:"hello"
        ,
        });
});

app.get("/api/sensors", async (req,res) => {
        try{
                const data = await pool.query("SELECT * FROM sensors");
                if(data[0]){
                        return res.json(data[0]);
                }

        }
        catch(error){
                return res.json(error);
        }


});

app.listen(PORT,()=> `this application is running in ${PORT}` );
                                                               