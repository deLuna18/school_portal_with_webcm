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
//router to display all users
router.get("/",(req,res)=>{
	let sql = "SELECT * FROM `users`";
	db.query(sql,(err,results,fields)=>{
		if(err){
			console.log({message:'query error'});
			res.status(500).json({message:err});
		}
		res.status(200).json(results);
	});
});

//router to display one user
router.get("/:email",(req,res)=>{
	let email = req.params.email;
	let sql = "SELECT * FROM `users` WHERE `email`=?"; //using placeholder
	db.query(sql,email,(err,results,fields)=>{
		if(err){
			console.log({message:'query error'});
			res.status(500).json({message:err});
		}
		res.status(200).json(results);
	});
});

//router to delete one user
router.delete("/:email",(req,res)=>{
	let email = req.params.email;
	let sql = "DELETE FROM `users` WHERE `email`=?"; //using placeholder
	db.query(sql,email,(err,results,fields)=>{
		if(err){
			console.log({message:'query error'});
			res.status(500).json({message:err});
		}
		res.status(200).json(results);
	});
});

//router to add one user
router.post("/",(req,res)=>{
	let email = req.body.email;
	let password = req.body.password;
	
	let sql = "INSERT INTO `users`(`email`,`password`) VALUES('"+email+"','"+password+"')"
	db.query(sql,(err,results,fields)=>{
		if(err){
			console.log({message:'query error'});
			res.status(500).json({message:err});
		}
		res.status(200).json(results);
	});
});

//router to update one user
router.put("/",(req,res)=>{
	let email = req.body.email;
	let password = req.body.password;
	
	let sql = "UPDATE `users` SET `password`='"+password+"' WHERE `email`='"+email+"'"
	db.query(sql,(err,results,fields)=>{
		if(err){
			console.log({message:'query error'});
			res.status(500).json({message:err});
		}
		res.status(200).json(results);
	});
});

router.post("/login", (req, res) => {
    const { email, password } = req.body;
    const sql = "SELECT * FROM `users` WHERE `email` = ? AND `password` = ?";
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.log({ message: 'query error', error: err });
            res.status(500).json({ message: 'Internal server error' });
        } else {
            if (results.length > 0) {
                // User authenticated successfully
                res.status(200).json({ message: 'Login successful' });
            } else {
                // Invalid email or password
                res.status(401).json({ message: 'Invalid email or password' });
            }
        }
    });
});


module.exports = router