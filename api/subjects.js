const express = require("express");
const mysql = require("mysql");
const router = express.Router();
require("dotenv").config()
const db_config= {
	host:process.env.DB_HOST,
	user:process.env.DB_USER,
	password:process.env.DB_PASSWORD,
	database:process.env.DB_NAME,
	multipleStatements:true
}
const db = mysql.createPool(db_config);
//
//router to display all subjects
router.get("/",(req,res)=>{
	let sql = "SELECT * FROM `subjects`";
	
	db.query(sql,(err,results,fields)=>{
		if(err){
			console.log({message:'query error'});
			res.status(500).json({message:err});
		}
		res.status(200).json(results);
	});
});

router.get("/:page/:size", (req, res) => {
	let page = parseInt(req.params.page);
	let size = parseInt(req.params.size);
    let sql = "SELECT * FROM `subjects` LIMIT ? OFFSET ?";
    let values = [size, (page -1) * size];
    
    db.query(sql, values, (err, results, fields) => {
        if (err) {
            console.log({ message: 'query error' });
            res.status(500).json({ message: err });
        }
        res.status(200).json(results);
    });
});

router.get("/:page/:size/:search", (req, res) => {
	let search = '%' + req.params.search + '%';
	let page = parseInt(req.params.page);
	let size = parseInt(req.params.size);
    let sql = "SELECT * FROM `subjects` WHERE `edpcode` LIKE ? OR `subjectcode` LIKE ? OR `time` LIKE ? OR `days` LIKE ? OR `room` LIKE ? LIMIT ? OFFSET ?";
    let values = [search, search, search, search, search, size, (page -1) * size];
    
    db.query(sql, values, (err, results, fields) => {
        if (err) {
            console.log({ message: 'query error' });
            res.status(500).json({ message: err });
        }
        res.status(200).json(results);
    });
});

//router to display one subject
router.get("/:edpcode",(req,res)=>{
	let edpcode = req.params.edpcode;
	let sql = "SELECT * FROM `subjects` WHERE `edpcode`=?"; //using placeholder
	
	db.query(sql,edpcode,(err,results,fields)=>{
		if(err){
			console.log({message:'query error'});
			res.status(500).json({message:err});
		}
		res.status(200).json(results);
	});
});

//router to delete one subject
router.delete("/:edpcode", (req, res) => {
    let edpcode = req.params.edpcode;
    let sql = "DELETE FROM `subjects` WHERE `edpcode`=?";
    
    db.query(sql, edpcode, (err, results, fields) => {
        if (err) {
            console.log({ message: 'query error' });
            res.status(500).json({ message: err });
        }
        res.status(200).json(results);
    });
});

//router to add one subject
router.post("/", (req, res) => {
    let edpcode = req.body.edpcode;
    let subjectcode = req.body.subjectcode;
    let time = req.body.time;
    let days = req.body.days;
    let room = req.body.room;
    let sql = "INSERT INTO `subjects` (`edpcode`, `subjectcode`, `time`, `days`, `room`) VALUES (?, ?, ?, ?, ?)";
    let values = [edpcode, subjectcode, time, days, room];
	
	if (edpcode.trim().length == 0) {
		res.status(400).json({message: 'EDP code is required.'});
		return;
	} else if (subjectcode.trim().length == 0) {
		res.status(400).json({message: 'Subject code is required.'});
		return;
	} else if (time.trim().length == 0) {
		res.status(400).json({message: 'Time is required.'});
		return;
	} else if (days.trim().length == 0) {
		res.status(400).json({message: 'Days is required.'});
		return;
	} else if (room.trim().length == 0) {
		res.status(400).json({message: 'Room is required.'});
		return;
	}

    db.query(sql, values, (err, results, fields) => {
        if (err) {
            console.log({ message: 'query error' });
            res.status(500).json({ message: err });
        }
        res.status(200).json(results);
    });
});

//router to update one student
router.put("/:edpcode", (req, res) => {
    let edpcode = req.body.edpcode;
    let subjectcode = req.body.subjectcode;
    let time = req.body.time;
    let days = req.body.days;
    let room = req.body.room;
    let sql = "UPDATE `subjects` SET `edpcode`=?, `subjectcode`=?, `time`=?, `days`=?, `room`=? WHERE `edpcode`=?";
    let values = [edpcode, subjectcode, time, days, room, req.params.edpcode];

    db.query(sql, values, (err, results, fields) => {
        if (err) {
            console.log({ message: 'query error' });
            res.status(500).json({ message: err });
        }
        res.status(200).json(results);
    });
});

module.exports = router