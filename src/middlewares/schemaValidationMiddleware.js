require('dotenv').config();
const Ajv = require('ajv');
const schema = require('../models/schema');
const ajv = new Ajv();
const validate = ajv.compile(schema)

const validateSchema = async (req,res,next) => {
    try {
      isValid = validate(req.body) 
      if (isValid) { 
          req.schema = "valid"; 
      } else { 
          req.schema = "invalid"; 
          console.log('Invalid Schema, log will not be added to queue.')
      }
  next()
  }
  catch (error) {
    next(error)
  }
}

module.exports = validateSchema ;