const express = require('express');
const app = express();
const passport=require("passport");
const LocalStrategy=require('passport-local').Strategy;
const session = require('express-session');
const flash = require('connect-flash');


const port = process.env.PORT || 8080;


// EJS 
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

//session
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
  
   //Initialize Passport  
    app.use(passport.initialize());
  app.use(passport.session());

  app.use(flash())
  app.use((req,res,next)=>{
    res.locals.message=req.flash('message');
    next();
  });

  //Passport Local Strategy
  passport.use(new LocalStrategy((username, password, done) => {
      
      const query = 'SELECT * FROM users WHERE username = ?';
      db.query(query, [username], (err, results) => {
          if (err) {
              return done(err);
          }
          if (results.length === 0) {
              return done(null, false, { message: 'Incorrect username.' });
          }
          const user = results[0];
          
          if (user.password !== password) { 
              return done(null, false, { message: 'Incorrect password.' });
          }
          return done(null, user); 
      });
  }));

  //Serialize user into session
  passport.serializeUser((user, done) => {
      done(null, user.id); 
  });
  
  // Deserialize user from session
  passport.deserializeUser((id, done) =>{
      const query = 'SELECT * FROM users WHERE id = ?';
      db.query(query, [id], (err, results) => {
          if (err) {
              return done(err);
          }
          done(null, results[0]); 
      });
  });








const mysql = require('mysql');

// MySQL connection
const db = mysql.createConnection({
  host: 'localhost',    
  user: 'root',         
  password: '',         
  database: 'employee_management'
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to the MySQL database.');
  }
});

//  Basic route
app.get('/', (req, res) => {

 res.render('index',{messages:{error:req.flash('error')}}); 
 });

 //Route to manage employees (admin access)
app.get('/employees', (req, res) => {
const query='SELECT * FROM employees';
db.query(query,(err,results)=>{
    if(err){
        console.log('error when fetching employees')
        res.send('error  fetching employees')
    }
    else{
        res.render('employees.ejs', { employees:results});

    }
})

});
//form for add
app.get('/add-employee', (req, res) => {
    res.render('add-employee'); 
  });
//add
  app.post('/add-employee', (req, res) => {
    
    const Data = {
      name: req.body.name,
      position: req.body.position,
      salary: req.body.salary,
      date_of_joining: req.body.date_of_joining,
      
    };
  
    // Insert data 
    const query = 'INSERT INTO employees (name, position, salary, date_of_joining) VALUES (?, ?, ?, ?)';
    db.query(query, [Data.name, Data.position, Data.salary, Data.date_of_joining], (err, result) => {
      if (err) {
        console.error('Error inserting employee:', err);
        res.send('Error inserting employee.');
      } else {
        console.log('Employee inserted successfully:', result);
        res.redirect('/employees'); 
      }
    });
  });
//edit
  app.get('/edit-employee/:id', (req, res) => {
    const employeeId = req.params.id;

    //  to get the employee by ID
    const query = 'SELECT * FROM employees WHERE id = ?';
    db.query(query, [employeeId], (err, results) => {
        if (err) {
            console.error('Error fetching employee for editing:', err);
            res.send('Error fetching employee.');
        } else {
            res.render('edit-employee', { employee: results[0] }); 
        }
    });
});
//update
app.post('/update-employee/:id', (req, res) => {
    const employeeId = req.params.id;
    const { name, position, salary, date_of_joining } = req.body;

    // to update the employee in the database
    const query = 'UPDATE employees SET name = ?, position = ?, salary = ?, date_of_joining = ? WHERE id = ?';
    db.query(query, [name, position, salary, date_of_joining, employeeId], (err, result) => {
        if (err) {
            console.error('Error updating employee:', err);
            res.send('Error updating employee.');
        } else {
            console.log('Employee updated successfully:', result);
            res.redirect('/employees'); 
        }
    });
});

//dlete

app.post('/delete-employee/:id', (req, res) => {
    const employeeId = req.params.id;

    //  to delete the employee from the database
    const query = 'DELETE FROM employees WHERE id = ?';
    db.query(query, [employeeId], (err, result) => {
        if (err) {
            console.error('Error deleting employee:', err);
            res.send('Error deleting employee.');
        } else {
            console.log('Employee deleted successfully:', result);
            res.redirect('/employees');
        }
    });
});
//login
app.get('/', (req, res) => {
    res.render('index',{message:req.flash('error')}); // Renders the login.ejs file
});
//employee dashboard
app.get('/employee-dashboard', (req, res) => {
    console.log('Authenticated:', req.isAuthenticated());
    console.log('User:', req.user);
    if (req.isAuthenticated() && req.user.role === 'employee') {
        res.render('employee-dashboard', { user: req.user });
    } else {
        res.send('Access denied'); 
    }
});
//logout
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect('/'); 
    });
});

// Login route
app.post('/login', passport.authenticate('local', {
    failureRedirect: '/', 
    failureFlash: true 
}), (req, res) => {
    
    if (req.user.role === 'admin') {
        res.redirect('/employees'); 
    } else if(req.user.role==='employee'){
        res.redirect('/employee-dashboard'); 
    }
});
app.listen(port,()=>{
    console.log("listening to the port:8080");
});