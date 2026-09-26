const mongoose = require('mongoose');
const ClassDetails = require('../models/ClassDetails');
const Form2 = require('../models/Form2');
const Form1 = require('../models/Form1');
const Form3 = require('../models/Form3');
const CoScholastic = require('../models/CoScholastic');
const logger = require('./logger');

const migrateClassNames = async () => {
  try {
    const classDetails = await ClassDetails.find({}).lean();
    if (!classDetails || !classDetails.length) return;

    const classMap = {};
    classDetails.forEach((c) => {
      if (c._id && c.className) {
        classMap[c._id.toString()] = c.className;
      }
    });

    const objectIdRegex = /^[a-f\d]{24}$/i;

    // Migrate Form2 (Classroom Walkthrough) records where className is an ObjectId
    const form2Records = await Form2.find({
      'grenralDetails.className': { $regex: objectIdRegex },
    }).lean();

    if (form2Records.length > 0) {
      logger.info(`Migrating ${form2Records.length} Form2 records with ObjectId in className...`);
      for (const f of form2Records) {
        const idStr = f?.grenralDetails?.className;
        if (idStr && classMap[idStr]) {
          await Form2.updateOne(
            { _id: f._id },
            { $set: { 'grenralDetails.className': classMap[idStr] } }
          );
        }
      }
      logger.info(`Form2 className migration completed successfully.`);
    }

    // Migrate Form1 (Fortnightly Monitor) records where className is an ObjectId
    const form1Records = await Form1.find({
      className: { $regex: objectIdRegex },
    }).lean();

    if (form1Records.length > 0) {
      for (const f of form1Records) {
        if (f.className && classMap[f.className]) {
          await Form1.updateOne(
            { _id: f._id },
            { $set: { className: classMap[f.className] } }
          );
        }
      }
      logger.info(`Form1 className migration completed.`);
    }

    // Migrate Form3 (Notebook Checking) records where className is an ObjectId
    const form3Records = await Form3.find({
      'grenralDetails.className': { $regex: objectIdRegex },
    }).lean();

    if (form3Records.length > 0) {
      for (const f of form3Records) {
        const idStr = f?.grenralDetails?.className;
        if (idStr && classMap[idStr]) {
          await Form3.updateOne(
            { _id: f._id },
            { $set: { 'grenralDetails.className': classMap[idStr] } }
          );
        }
      }
      logger.info(`Form3 className migration completed.`);
    }

    // Migrate CoScholastic records where className is an ObjectId
    const coScholasticRecords = await CoScholastic.find({
      'grenralDetails.className': { $regex: objectIdRegex },
    }).lean();

    if (coScholasticRecords.length > 0) {
      for (const f of coScholasticRecords) {
        const idStr = f?.grenralDetails?.className;
        if (idStr && classMap[idStr]) {
          await CoScholastic.updateOne(
            { _id: f._id },
            { $set: { 'grenralDetails.className': classMap[idStr] } }
          );
        }
      }
      logger.info(`CoScholastic className migration completed.`);
    }
  } catch (err) {
    logger.error('Error during auto-migration of class names:', err);
  }
};

module.exports = migrateClassNames;
