require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const app = express();
const MOVIE_DATA = require("./movies-data.json");
const morganSetting = process.env.NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

function handleAuthorization(req, res, next) {
  if ((req.headers.authorization.split(" ")[1] !== process.env.API_KEY) || !req.headers.authorization)
    return res.status(401).send("invalid authorization");
  next();
}

app.use(handleAuthorization);
app.use((error,req,res,next)=>{
  let response = {}
  if (process.env.NODE_ENV === 'production'){
    response = {error: {message: 'server error'}}
  } else {
    response = {error}
  }
  res.status(500).json(response)
})

function handleMovieRoute(req, res) {
  const { genre = null, country = null, avg_vote = null } = req.query;
  let response = MOVIE_DATA;

  if (genre) {
    response = response.filter((movie) => {
      return movie.genre.toLowerCase().includes(genre.toLowerCase());
    });
  }

  if (country) {
    response = response.filter((movie) => {
      return movie.country.toLowerCase().includes(country.toLowerCase());
    });
  }

  if (avg_vote) {
    response = response.filter((movie) => {
      return movie.avg_vote >= avg_vote ? true : false;
    });
  }

  res.json(response);
}

app.get("/movie", handleMovieRoute);

module.exports = app;
