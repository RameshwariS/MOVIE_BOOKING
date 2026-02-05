const express = require("express")
// const bodyParser = require("body-parser")
const dotenv = require("dotenv")
const mongoose  = require('mongoose')

//load env
dotenv.config();

//importing routes
const movieRoute =  require('./routes/movie.routes');
const theaterRoute = require('./routes/theater.routes');
const userRoute = require('./routes/user.routes');
const showRoute = require('./routes/show.routes');
const bookingRoute = require('./routes/booking.routes');


const PORT = process.env.PORT || 8000
const app = express()

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


movieRoute(app);
theaterRoute(app);
userRoute(app);
showRoute(app);
bookingRoute(app);

app.get('/home',(req,res)=>{
    res.send("HI")
})
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("DB connected!");

    app.listen(PORT, () => {
      console.log(`Server started on ${PORT}!!`);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });
