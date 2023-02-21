require('dotenv').config()
const express = require('express')
const app = express()
const path = require('path')
const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const PORT = process.env.PORT || 3500
const root = require('./routes/root')

console.log(process.env.NODE_ENV);

app.use(logger)
app.use(express.json())

app.use(cookieParser)
app.use(cors(corsOptions))
 


app.use('/',express.static(path.join(__dirname, '/public')))
app.use('/',root)
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

app.listen(PORT, ()=>{
    console.log(`Server Running on Port ${PORT}`);
}
)