require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const { errors } = require('celebrate');
const { limiter, devDatabaseUrl } = require('./utils/config');
const router = require('./routes/routes');
const errorHandler = require('./middlewares/error-handler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const { PORT = 3000, NODE_ENV, DATABASE_URL } = process.env;

mongoose.set('strictQuery', false);
mongoose.connect(NODE_ENV === 'production' ? DATABASE_URL : devDatabaseUrl);

const app = express();

const options = {
  origin: [
    'http://localhost:3000',
    'https://movies-explorer.gorod.nomoredomains.work',
    'http://movies-explorer.gorod.nomoredomains.work',
  ],
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
  allowedHeaders: ['Content-Type', 'origin', 'Authorization'],
  credentials: true,
};
app.use('*', cors(options));
app.use(helmet());
app.use(express.json());
app.use(requestLogger);
app.use(limiter);
app.use(router);
app.use(errorLogger);

app.use(errors());
app.use(errorHandler);

app.listen(PORT);
