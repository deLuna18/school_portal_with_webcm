var app = angular.module("myapp", ["ngRoute"]);

// LOGIN, MAIN, STUDENT, SUBJECT, ENROLLMENT, REPORT
app.config(function($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: 'login.html',
            controller: 'loginController'
        })
        .when("/student", {
            templateUrl: 'student.html',
            controller: 'studentController'
        })
        .when("/subject", {
            templateUrl: 'subject.html',
            controller: 'subjectController'
        })
        .when("/enrollment", {
            templateUrl: 'enrollment.html',
            controller: 'enrollmentController'
        })
        .when("/report", {
            templateUrl: 'report.html',
            controller: 'reportController'
        })
        .otherwise({ redirectTo: '/' });
});

// LOGOUT CONTROLLER
app.controller("logoutController", function($rootScope, $location) {
    $rootScope.logout = function() {
        localStorage.removeItem('user'); 
        $rootScope.logged = false;
        $location.path("/"); 
    };
});

//LOGIN CONTROLLER
app.controller("loginController", function($scope, $rootScope, $location, $http) {
	if (localStorage.getItem('user') !== null) {
		$rootScope.logged = true;
		$location.path("/student");
		return;
	}
	
    $scope.login = function() {
        var email = $scope.email;
        var password = $scope.password;
        
        $http.post("/api/users/login", { email: email, password: password })
            .then(function(response) {
                $rootScope.logged = true;
                $rootScope.message = "Login successful!";
                localStorage.setItem('user', email);
                $location.path("/student"); 
            })
            .catch(function(error) {
                console.log("Error:", error);
                $rootScope.logged = false;
                $rootScope.message = "Invalid Credentials. Please try again!";
            });
    };
});

// STUDENT CONTROLLER
app.controller("studentController", function($scope, $http) {
	$scope.courses = [
		'',
        'bsit',
        'bsce',
        'bsed'
    ];
    
    $scope.levels = [
    	'',
    	1,
    	2,
    	3,
    	4
    ];
    
    $scope.pagesizes = [
    	5,
    	10,
    	15,
    	20
    ];
    
    $scope.defaultPageSize = 5;
    $scope.pageSize = 5;
    $scope.page = 1;
    $scope.search = '';
    
    $scope.addFlag = true;
    $scope.editFlag = false;
    $scope.nextFlag = false;
    
    $scope.studentIdno = '';
    $scope.students = [];

    $scope.capturedImage = '';
    
    $scope.changePage = function() {
    	$scope.getStudents();
    };
    
    $scope.changeCourse = function() {
    	$scope.newCourse = $scope.selectedCourse;
    };
    
    $scope.changeLevel = function() {
    	$scope.newLevel = $scope.selectedLevel;
    };

    // CAPTURE IMAGE
    $scope.captureImage = function() {
        Webcam.snap(function(data_uri) {
            $scope.capturedImage = data_uri;
        });
    };

    // WEBCAM
    Webcam.set({
        dest_width: 200,
        dest_height: 150,
        image_type: 'jpeg',
        image_quality: 90
    });
        
    // RETAKE PICTURE
    $scope.retakePicture = function() {
        $scope.capturedImage = '';
    };

    // RESULT
    $scope.$watch('capturedImage', function(newVal, oldVal) {
        if (newVal !== oldVal && newVal !== '') {
            Webcam.reset();
        } else {
            initCamera();
        }
    });

    // INITIALIZE CAMERA
    function initCamera() {
        Webcam.attach('#my_camera');
    }

    // INITIALIZE CAMERA ON PAGE LOAD
    initCamera();
	
    // FETCH STUDENT 
    $scope.getStudents = function() {
        $http.get('/api/students/' + $scope.page + '/' + $scope.pageSize + '/' + $scope.search)
            .then(function(response) {
                $scope.students = response.data.map(function(student) {
                    student.imagePath = '/assets/image/' + student.image;
                    return student;
                });
            })
            .catch(function(error) {
                console.error('Error fetching students:', error);
            });
    };
    
    // PREVIOUS 
    $scope.prevList = function() {
    	if ($scope.page == 1) return;
    	
		$scope.page--;
		$scope.getStudents();
    };
    
    // NEXT
    $scope.nextList = function() {
    	if ($scope.students.length < $scope.pageSize) return;
    	
    	$scope.nextFlag = true;
    	$scope.page++;
    	$scope.getStudents();
    };

    // ADD STUDENT FUNCTION ~~ ADD STUDENT INFO AND IMAGE
    $scope.addStudent = function() {
        $scope.captureImage();

        var base64Data = $scope.capturedImage.split(',')[1];

        var student = {
            idno: $scope.newIdno,
            lastname: $scope.newLastname,
            firstname: $scope.newFirstname,
            course: $scope.newCourse,
            level: $scope.newLevel,
            imageData: base64Data
        };

        $http.post('/api/students', student)
        .then(function(response) {
            console.log('New student added:', response.data);
            var newStudent = response.data;
            newStudent.imagePath = '/assets/image/' + newStudent.image;
            $scope.students.push(newStudent);
            $scope.reset();
            $scope.retakePicture();
        })
        .catch(function(error) {
            console.error('Error adding student:', error);
        });
    };

    // EDIT STUDENT FUNCTION
    $scope.editStudent = function(student) {
    	$scope.addFlag = false;
    	$scope.editFlag = true;
        $scope.studentIdno = student.idno;
        
    	$scope.newIdno = student.idno;
        $scope.newLastname = student.lastname;
        $scope.newFirstname = student.firstname;
        $scope.newCourse = student.course;
        $scope.newLevel = student.level;
        $scope.selectedCourse = student.course;
        $scope.selectedLevel = student.level;
    };
    
    // UPDATE STUDENT FUNCTION
    $scope.updateStudent = function() {
        var student = {
            idno: $scope.newIdno,
            lastname: $scope.newLastname,
            firstname: $scope.newFirstname,
            course: $scope.newCourse,
            level: $scope.newLevel
        };

        $http.put('/api/students/' + $scope.studentIdno, student)
            .then(function(response) {
                $scope.getStudents();
                $scope.reset();
            })
            .catch(function(error) {
                console.error('Error updating student:', error);
            });
    };
    
    $scope.deleteStudent = function(idno) {
        var indexToDelete = $scope.students.findIndex(function(student) {
            return student.idno === idno;
        });
    
        var deletedStudent = $scope.students.splice(indexToDelete, 1)[0];
    
        console.log('Deleting student:', deletedStudent);
    
        $http.delete('/api/students/' + idno)
            .then(function(response) {
                var imageName = response.data.image;
                $http.delete('/api/students/images/' + imageName)
                    .then(function(imageResponse) {
                        console.log('Image deleted:', imageResponse);
                        console.log('Student deleted from database:', deletedStudent);
                    })
                    .catch(function(imageError) {
                        console.error('Error deleting image:', imageError);
                    });
            })
            .catch(function(error) {
                console.error('Error deleting student:', error);
                $scope.students.splice(indexToDelete, 0, deletedStudent);
            });
    };

    // RESET FUNCTION
    $scope.reset = function() {
        $scope.newIdno = '';
        $scope.newLastname = '';
        $scope.newFirstname = '';
        $scope.newCourse = '';
        $scope.newLevel = '';
        $scope.selectedCourse = '';
        $scope.selectedLevel = '';
    	$scope.addFlag = true;
    	$scope.editFlag = false;
    	$scope.nextFlat = false;
    	$scope.studentIdno = '';
        $scope.capturedImage = '';
    };

	$scope.reset();
    $scope.getStudents();
});

app.controller('subjectController', function($scope, $http) {
    $scope.pagesizes = [
    	5,
    	10,
    	15,
    	20
    ];
    
    $scope.defaultPageSize = 5;
    $scope.pageSize = 5;
    $scope.page = 1;
    $scope.search = '';
    
    $scope.addFlag = true;
    $scope.editFlag = false;
    $scope.nextFlag = false;
    
    $scope.subjectEdpcode = '';
    $scope.subjects = [];
    
    var constructDays = function() {
    	var days = '';
    	
    	days += document.getElementById('monday').checked ? 'm' : '';
        days += document.getElementById('tuesday').checked ? 't' : '';
        days += document.getElementById('wednesday').checked ? 'w' : '';
        days += document.getElementById('thursday').checked ? 'th' : '';
        days += document.getElementById('friday').checked ? 'f' : '';
        days += document.getElementById('saturday').checked ? 's' : '';
        
        return days;
    }
    
    $scope.changePage = function() {
    	$scope.getSubjects();
    };
    
    // FETCH SUBJECT
    $scope.getSubjects = function() {
    	var path = "/api/subjects/"  + $scope.page + "/" + $scope.pageSize + ($scope.search.trim().length > 0 ? "/" + $scope.search : "");
        $http.get(path)
	        .then(function(response) {
	        	if ($scope.nextFlag && (!response.data || response.data.length == 0)) {
	        		$scope.page--;
	        		return;
	        	}
	        	
	            $scope.subjects = response.data;
	        })
	        .catch(function(error) {
	            console.error("Error fetching subject data:", error);
	        });
    };
    
    // PREVIOUS
    $scope.prevList = function() {
    	if ($scope.page == 1) return;
    	
		$scope.page--;
		$scope.getSubjects();
    };
    
    // NEXT
    $scope.nextList = function() {
    	if ($scope.subjects.length < $scope.pageSize) return;
    	
    	$scope.nextFlag = true;
    	$scope.page++;
    	$scope.getSubjects();
    };

    // ADD SUBJECT FUNCTION
    $scope.addSubject = function() {
        var subject = {
            edpcode: $scope.newEdpcode,
            subjectcode: $scope.newSubjectcode,
            time: $scope.newTime,
            days: constructDays(),
            room: $scope.newRoom
        };

        $http.post('/api/subjects', subject)
            .then(function(response) {
                $scope.getSubjects();
                $scope.reset();
            })
            .catch(function(error) {
                console.error('Error adding subjects:', error);
            });
    };
    
    // EDIT STUDENT FUNCTION
    $scope.editSubject = function(subject) {
    	$scope.addFlag = false;
    	$scope.editFlag = true;
        $scope.subjectEdpcode = subject.edpcode;
        
    	$scope.newEdpcode = subject.edpcode;
        $scope.newSubjectcode = subject.subjectcode;
        $scope.newTime = subject.time;
        $scope.newRoom = subject.room;
        
        document.getElementById('monday').checked = subject.days.indexOf('m') > -1;
        document.getElementById('tuesday').checked = subject.days.indexOf('t') > -1 && subject.days.indexOf('t') != subject.days.indexOf('th');
        document.getElementById('wednesday').checked = subject.days.indexOf('w') > -1;
        document.getElementById('thursday').checked = subject.days.indexOf('th') > -1;
        document.getElementById('friday').checked = subject.days.indexOf('f') > -1;
        document.getElementById('saturday').checked = subject.days.indexOf('s') > -1;
    };
    
    // UPDATE SUBJECT FUNCTION
    $scope.updateSubject = function() {
        var subject = {
            edpcode: $scope.newEdpcode,
            subjectcode: $scope.newSubjectcode,
            time: $scope.newTime,
            days: constructDays(),
            room: $scope.newRoom
        };

        $http.put('/api/subjects/' + $scope.subjectEdpcode, subject)
            .then(function(response) {
                $scope.getSubjects();
                $scope.reset();
            })
            .catch(function(error) {
                console.error('Error updating subject:', error);
            });
    };
    
    // DELETE SUBJECT
    $scope.deleteSubject = function(edpcode) {
    	$http.delete('/api/subjects/' + edpcode)
            .then(function(response) {
                $scope.getSubjects();
            })
            .catch(function(error) {
                console.error('Error deleting subject:', error);
            });
    };
    
    // RESET FUNCTION
    $scope.reset = function() {
        $scope.newEdpcode = '';
        $scope.newSubjectcode = '';
        $scope.newTime = '';
        $scope.newRoom = '';
    	$scope.addFlag = true;
    	$scope.editFlag = false;
    	$scope.nextFlat = false;
    	$scope.subjectEdpcode = '';
    	
    	document.getElementById('monday').checked = false;
        document.getElementById('tuesday').checked = false;
        document.getElementById('wednesday').checked = false;
        document.getElementById('thursday').checked = false;
        document.getElementById('friday').checked = false;
        document.getElementById('saturday').checked = false;
    };
    
    $scope.reset();
    $scope.getSubjects();
});

// ENROLLMENT CONTROLLER
app.controller("enrollmentController", function($scope, $http) {
    $scope.selectedSubjects = [];
    $scope.deletedSubjects = [];
	
    $scope.resetInputs = function() {
        $scope.searchEdpcode = '';
        $scope.searchIdno = '';
        $scope.showDetails = false;
        $scope.showStudentImage = false;
        $scope.student = {};

        $scope.subjects.forEach(function(subject) {
            subject.selected = false;
        });
        $scope.subjects = [];
    };

    $scope.deleteSelectedSubjects = function() {
        var confirmDelete = confirm("Are you sure you want to delete the selected subjects?");
        if (confirmDelete) {
            $scope.subjects = $scope.subjects.filter(function(subject) {
                return !subject.selected;
            });
        } else {
            alert('Deletion cancelled by user');
            console.log('Deletion cancelled by user');
        }
        
       $scope.resetInputs();
        
    };

    $scope.searchEdpcode = '';
    $scope.subjects = [];

    // Function to search for EDP code
    $scope.searchByEdpcode = function() {
        
        if ($scope.searchEdpcode.trim() !== '') {
           
            $http.get('/api/subjects/' + $scope.searchEdpcode)
                .then(function(response) {
                   
                    $scope.subjects = response.data;
                })
                .catch(function(error) {
                    console.error('Error searching by EDP code:', error);
                });
        } else {
           
            $scope.subjects = [];
        }
    };

    // Fetch user's email from local storage
    $scope.userEmail = localStorage.getItem('user');
$scope.showStudentImage = false; 

    $scope.searchStudent = function() {
        $http.get('/api/students/' + $scope.searchIdno, {
            headers: { 'User-Email': localStorage.getItem('user') }
        })
        .then(function(response) {
            if (response.data && response.data.length > 0) {
                $scope.student = response.data[0];
                $scope.student.imagePath = '/assets/image/' + $scope.student.image; 
                $scope.showDetails = true;
                $scope.showStudentImage = true;
            } else {
                alert("Student not found!");
                $scope.showDetails = false;
                $scope.showStudentImage = false;
            }
        })
        .catch(function(error) {
            console.error('Error searching student:', error);
        });
    };


    // Function to fetch all subjects
    $scope.getAllSubjects = function() {
        
        $http.get('/api/subjects', {
            headers: { 'User-Email': localStorage.getItem('user') }
        })
            .then(function(response) {
               
                $scope.subjects = response.data;
            })
            .catch(function(error) {
                console.error('Error fetching subjects:', error);
            });
    };

    // Function to save enrollment data
    $scope.saveEnrollment = function() {
        
        var idno = $scope.searchIdno; 

        // Collect selected EDP codes
        var selectedEdpcodes = [];
        $scope.subjects.forEach(function(subject) {
            if (subject.selected) {
                selectedEdpcodes.push(subject.edpcode);
            }
        });

        // Send the IDNO and selected EDP codes to the backend
        $http.post('/api/enrollment', { idno: idno, edpcodes: selectedEdpcodes })
            .then(function(response) {
                console.log('Enrollment data saved successfully');
               
                $scope.enrollmentMessage = 'Enrolled by: ' + $scope.userEmail;
            })
            .catch(function(error) {
                console.error('Error saving enrollment data:', error);
                
            });
			 $scope.resetInputs();
    };
});

// REPORT CONTROLLER
app.controller("reportController", function($scope, $http) {
   
   $scope.resetInputs = function() {
        $scope.searchSubjects = '';
        $scope.subjectDetails = {};
        $scope.showDetails = false;
        $scope.enrollment = [];
    };
    $scope.resetInputs();

    $scope.searchSubject = function() {
        $http.get('/api/enrollment/' + $scope.searchSubjects)
            .then(function(response) {
                if (response.data && response.data.length > 0) {
                    $scope.enrollment = response.data;

                    // Fetch subject details based on the EDP code
                    $http.get('/api/subjects/' + $scope.searchSubjects)
                        .then(function(subjectResponse) {
                            if (subjectResponse.data && subjectResponse.data.length > 0) {
                                $scope.subjectDetails = subjectResponse.data[0]; 
                                $scope.showDetails = true;
                            } else {
                                $scope.showDetails = false;
                            }
                        })
                        .catch(function(error) {
                            console.error('Error fetching subject details:', error);
                            $scope.showDetails = false;
                        });

                    // Fetch student details for each enrollment record
                    angular.forEach($scope.enrollment, function(enroll) {
                        $http.get('/api/students/' + enroll.idno)
                            .then(function(studentResponse) {
                                if (studentResponse.data && studentResponse.data.length > 0) {
                                    enroll.student = studentResponse.data[0];
                                    enroll.student.imagePath = '/assets/image/' + enroll.student.image;
                                }
                            })
                            .catch(function(error) {
                                console.error('Error fetching student details:', error);
                            });
                    });
                } else {
                    alert("No enrollment data found for the given EDP code.");
                    $scope.enrollment = [];
                    $scope.showDetails = false;
                }
            })
            .catch(function(error) {
                console.error('Error searching enrollment data:', error);
                $scope.showDetails = false;
            });
    };


    $scope.deletedStudents = []; 

    $scope.deleteSelected = function() {
        var selectedStudents = $scope.enrollment.filter(function(enroll) {
            return enroll.selected;
        });

        if (selectedStudents.length === 0) {
            alert("Please select students to delete.");
            return;
        }

        
        $scope.deletedStudents = $scope.deletedStudents.concat(selectedStudents);

        
        $scope.enrollment = $scope.enrollment.filter(function(enroll) {
            return !enroll.selected;
        });
        $scope.resetInputs();
    };

    $scope.saveDeletedStudents = function() {
        if ($scope.deletedStudents.length === 0) {
            alert("No students to save.");
            return;
        }

        var idnosToDelete = $scope.deletedStudents.map(function(student) {
            return student.idno;
        });

        $http.delete('/api/enrollment', { params: { idnos: idnosToDelete } })
            .then(function(response) {
                
                console.log(response.data.message);
            
                $scope.deletedStudents = [];
            })
            .catch(function(error) {
                console.error('Error deleting selected students:', error);
            });
            $scope.resetInputs();
    };
    $scope.confirmSave = function() {
        var confirmSave = confirm("Are you sure you want to save changes?");
        if (confirmSave) {
            $scope.saveDeletedStudents();
            $scope.resetInputs();
        }
    };

});


// MENU CONTROLLER
app.controller("navController", function($scope, $rootScope, $location, $http) {
    document.body.style.backgroundColor = "white";
	$scope.isNavOpen = false;
	
    $scope.toggleNav = function() {
    	var sidenav = document.getElementById("mySidenav");
    	
    	if ($scope.isNavOpen) {
        	$scope.closeNav();
        } else {
            $scope.openNav();
        }
    };
    
    $scope.openNav = function() {
    	document.getElementById("mySidenav").style.width = "198px";
        document.querySelector('.left').style.marginLeft = "198px";
        document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
        $scope.isNavOpen = true;
    };
    
    $scope.closeNav = function() {
    	document.getElementById("mySidenav").style.width = "0";
        document.querySelector('.left').style.marginLeft = "0";
        document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
        $scope.isNavOpen = false;
    };
    
    $scope.navTo = function(path) {
    	$location.path(path);
    };
    
    $scope.logout = function() {
    	localStorage.removeItem('user'); 
        $rootScope.logged = false;
        $location.path("/"); 
    };
});



