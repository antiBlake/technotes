require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const connectDB = require('./config/dbConn')
const mongoose = require('mongoose')
const { logEvents } = require('./middleware/logger')
const corsOptions = require('./config/corsOptions')
const PORT = process.env.PORT || 3500
const root = require('./routes/root')
const userRoutes = require('./routes/userRoutes')


mongoose.set("strictQuery", true);
connectDB()

console.log(process.env.NODE_ENV);

app.use(logger)
app.use(express.json())

app.use(cookieParser())
app.use(cors(corsOptions))
 


app.use('/',express.static(path.join(__dirname, '/public')))
app.use('/', root)
// app.use('/users', userRoutes)

app.all('*', (req, res)=>{
    res.status(404)
    if(req.accepts('html')){
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if (req.accepts('json')){
        res.json({
            message: "not found"
        })

    } else{
        res.type('txt').send('404 not found')
    }
})

app.use(errorHandler)


mongoose.connection.once('open', ()=>{
    console.log('connected to mongoDB');
    app.listen(PORT, ()=>{
        console.log(`Server Running on Port ${PORT}`);
    }
    )
})

mongoose.connection.on('error', err =>{
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err .hostname}`,
'./logs/mongoErrLog.log')
} )
