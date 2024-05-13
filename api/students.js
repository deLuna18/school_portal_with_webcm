const express = require("express");
const mysql = require("mysql");
const router = express.Router();
const fs = require('fs');
const path = require('path');

require("dotenv").config()
const db_config= {
	host:process.env.DB_HOST,
	user:process.env.DB_USER,
	password:process.env.DB_PASSWORD,
	database:process.env.DB_NAME,
	multipleStatements:true
}
const db = mysql.createPool(db_config);

// DISPLAY ALL STUDENT
router.get("/", (req, res) => {
    let sql = "SELECT * FROM `students`";
    
    db.query(sql, (err, results, fields) => {
        if (err) {
            console.log({ message: 'query error' });
            res.status(500).json({ message: err });
        }
        res.status(200).json(results);
    });
});

// PAGES, SIZE
router.get("/:page/:size", (req, res) => {
	let page = parseInt(req.params.page);
	let size = parseInt(req.params.size);
    let sql = "SELECT * FROM `students` LIMIT ? OFFSET ?";
    let values = [size, (page -1) * size];
    
    db.query(sql, values, (err, results, fields) => {
        if (err) {
            console.log({ message: 'query error' });
            res.status(500).json({ message: err });
        }
        res.status(200).json(results);
    });
});

// PAGE , SIZE, SEARCH
router.get("/:page/:size/:search", (req, res) => {
	let search = '%' + req.params.search + '%';
	let page = parseInt(req.params.page);
	let size = parseInt(req.params.size);
    let sql = "SELECT * FROM `students` WHERE `idno` LIKE ? OR `lastname` LIKE ? OR `firstname` LIKE ? OR `course` LIKE ? OR `level` LIKE ? LIMIT ? OFFSET ?";
    let values = [search, search, search, search, search, size, (page -1) * size];
    
    db.query(sql, values, (err, results, fields) => {
        if (err) {
            console.log({ message: 'query error' });
            res.status(500).json({ message: err });
        }
        res.status(200).json(results);
    });
});

// DISPLAY STUDENT DETAILS
router.get("/:idno",(req,res)=>{
	let idno = req.params.idno;
	let sql = "SELECT * FROM `students` WHERE `idno`=?"; 
	
	db.query(sql,idno,(err,results,fields)=>{
		if(err){
			console.log({message:'query error'});
			res.status(500).json({message:err});
		}
		res.status(200).json(results);
	});
});

// DELETE STUDENT DETAILS
router.delete("/:idno", (req, res) => {
    const idno = req.params.idno;
    const getImageQuery = "SELECT `image` FROM `students` WHERE `idno`=?";
    const deleteStudentQuery = "DELETE FROM `students` WHERE `idno`=?";

    db.query(getImageQuery, idno, (err, results) => {
        if (err) {
            console.error('Error fetching image filename:', err);
            return res.status(500).json({ message: 'Error fetching image filename.' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const imageName = results[0].image;
        const imagePath = path.join(__dirname, '..', 'public', 'assets', 'image', imageName);

        // DELETE STUDENT RECORD FROM DATBASE
        db.query(deleteStudentQuery, idno, (deleteErr, deleteResults) => {
            if (deleteErr) {
                console.error('Error deleting student:', deleteErr);
                return res.status(500).json({ message: 'Error deleting student.' });
            }

            // DELETE IMAGE FROM FOLDER
            fs.unlink(imagePath, (unlinkErr) => {
                if (unlinkErr) {
                    if (unlinkErr.code === 'ENOENT') {
                        console.warn('File does not exist:', imagePath);
                        return;
                    }
                    console.error('Error deleting image file:', unlinkErr);
                    return res.status(500).json({ message: 'Error deleting image file.' });
                }
            
                console.log('Student and associated image deleted successfully:', idno);
                res.status(200).json({ message: 'Student and associated image deleted successfully.' });
            });
        });
    });
});

//ADD STUDENT
router.post("/", (req, res) => {
    const { idno, lastname, firstname, course, level, imageData } = req.body;
    const imageName = idno + '_' + lastname + '_' + firstname + '.jpg'; 
    const imagePath = path.join(__dirname, '..', 'public', 'assets', 'image', imageName);

    const decodedImage = Buffer.from(imageData, 'base64');

    fs.writeFile(imagePath, decodedImage, (err) => {
        if (err) {
            console.error('Error saving image:', err);
            res.status(500).json({ message: 'Error saving image.' });
            return;
        }

        console.log('Image saved successfully:', imagePath);

        const sql = "INSERT INTO `students` (`idno`, `lastname`, `firstname`, `course`, `level`, `image`) VALUES (?, ?, ?, ?, ?, ?)";
        const values = [idno, lastname, firstname, course, level, imageName];

        db.query(sql, values, (err, results, fields) => {
            if (err) {
                console.error('Error inserting student:', err);
                res.status(500).json({ message: 'Error inserting student.' });
                return;
            }
            res.status(200).json({ idno, lastname, firstname, course, level, image: imageName });
        });
    });
});

//UPDATE STUDENT
router.put("/:idno",(req,res)=>{
	let idno = req.body.idno;
	let lastname = req.body.lastname;
	let firstname = req.body.firstname;
	let course = req.body.course;
	let level = req.body.level;
	let sql = "UPDATE `students` SET `idno`=?, `lastname`=?, `firstname`=?, `course`=?, `level`=? WHERE `idno`=?";
	let values = [idno, lastname, firstname, course, level, req.params.idno];
	
	if (idno.trim().length == 0) {
		res.status(400).json({message: 'ID no is required.'});
		return;
	} else if (lastname.trim().length == 0) {
		res.status(400).json({message: 'Lastname is required.'});
		return;
	} else if (firstname.trim().length == 0) {
		res.status(400).json({message: 'Firstname is required.'});
		return;
	} else if (course.trim().length == 0) {
		res.status(400).json({message: 'Course is required.'});
		return;
	} else if (level.trim().length == 0) {
		res.status(400).json({message: 'Level is required.'});
		return;
	}
	
	db.query(sql,values,(err,results,fields)=>{
		if(err){
			console.log({message:'query error'});
			res.status(500).json({message:err});
		}
		res.status(200).json(results);
	});
});

module.exports = router