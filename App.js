var express = require('express');
const bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('./logs/logger');
// var logger = require('morgan');

const summaryRoutes = require('./Summary/Summary');
const simulationRoutes = require('./Simulation/Simulation');
const indexRoutes = require('./routes/index');

const compression = require('compression')


var app = express();
// logger.info("Vivek Joshi | \t Test data")
// logger.debug("Vivek Joshi | \t Test data debug")
// logger.error("Vivek Joshi | \t test error")
// logger.verbose("Vivek Joshi | \t final verbose")

app.use(compression({
  level: 6,
  threshold: 10*1000,
  filter: (req, res) =>{
    if (req.header ['x-no-compression']){
      return false
    }
return compression.filter(req,res)
  }
}))


app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
  });

app.use(bodyParser.json({limit : '30mb'}));
// app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRoutes);

app.use('/summary', summaryRoutes);

app.use('/simulation', simulationRoutes);


//API TO PRINT FRONTEND ERROR LOGS

app.post("/pushErrorLogs",(req,res) => {
  if(req.query.logType == 'info'){
    logger.info(`${req.query.userName} | \t ${req.query.functionName} | \t ${req.query.msg}`)
  }
  else if(req.query.logType == 'debug'){
    logger.debug(`${req.query.userName} | \t ${req.query.functionName} | \t ${req.query.msg}`)
  }
  else if(req.query.logType == 'verbose'){
    logger.verbose(`${req.query.userName} | \t ${req.query.functionName} | \t ${req.query.msg}`)
  }
  res.status(200).json({error : "Error Log pushed Successfully"})
})

module.exports = app;
