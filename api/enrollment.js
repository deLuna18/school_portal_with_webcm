// Import required packages
const express = require("express");
const mysql = require("mysql");
const router = express.Router();
require("dotenv").config();

// Database configuration
const db_config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true
};

// Create a MySQL connection pool
const db = mysql.createPool(db_config);

// Route to fetch enrollment records with student details by EDP code
router.get("/:edpcode", (req, res) => {
    let edpcode = req.params.edpcode;
    let sql = "SELECT e.*, s.lastname, s.firstname, s.course, s.level FROM `enrollment` e INNER JOIN `students` s ON e.idno = s.idno WHERE e.`edpcode`=?";
    db.query(sql, [edpcode], (err, results, fields) => {
        if (err) {
            console.error('Error retrieving enrollment record:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        res.status(200).json(results);
    });
});


// Route to save enrollment data
router.post("/", (req, res) => {
    let idno = req.body.idno;
    let edpcodes = req.body.edpcodes; // Assuming it's an array of selected EDP codes

    // Construct SQL query to insert enrollment data
    let sql = "INSERT INTO `enrollment` (`idno`, `edpcode`) VALUES ?";
    let values = edpcodes.map(edpcode => [idno, edpcode]);

    db.query(sql, [values], (err, results, fields) => {
        if (err) {
            console.error('Error saving enrollment data:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        res.status(200).json({ message: 'Enrollment data saved successfully' });
    });
});


// Route to display all enrollment records
router.get("/", (req, res) => {
    let sql = "SELECT * FROM `enrollment`";
    db.query(sql, (err, results, fields) => {
        if (err) {
            console.error('Error retrieving enrollment records:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        res.status(200).json(results);
    });
});

// Route to display enrollment record by EDP code
router.get("/:edpcode", (req, res) => {
    let edpcode = req.params.edpcode;
    let sql = "SELECT * FROM `enrollment` WHERE `edpcode`=?";
    db.query(sql, [edpcode], (err, results, fields) => {
        if (err) {
            console.error('Error retrieving enrollment record:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        res.status(200).json(results);
    });
});


// Route to delete enrollment records by IDNO
router.delete("/", (req, res) => {
    let idnos = req.query.idnos;
    let sql = "DELETE FROM `enrollment` WHERE `idno` IN (?)";
    db.query(sql, [idnos], (err, results, fields) => {
        if (err) {
            console.error('Error deleting enrollment records:', err);
            res.status(500).json({ message: 'Internal server error' });
            return;
        }
        res.status(200).json({ message: 'Enrollment records deleted successfully' });
    });
});








// Export the router
module.exports = router;
