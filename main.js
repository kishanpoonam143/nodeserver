var express = require('express');
var app = express();
var fs = require("fs");
var cors = require('cors')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

app.get('/listTransactions', function (req, res) {
   fs.readFile(__dirname + "/" + "transactions.json", 'utf8', function (err, data) {
      if (err) {
         res.send({ message: "Unable to get transactions", statusCode: 500 });
         return;
      }
      if (data.length > 0)
         res.send(data);
      else
         res.send({ message: "No transactions found" })
   });
})
app.get('/listTransactions/:id', function (req, res) {
   var transactions = [];
   var userTransactions = [];
   fs.readFile(__dirname + "/" + "transactions.json", 'utf8', function (err, data) {
      if (err) {
         res.send({ message: "Unable to get transactions", statusCode: 500 });
         return;
      }
      transactions = JSON.parse(data);
      if (transactions.length > 0){
        transactions.some(transaction=>{
           if(transaction.userId == req.params['id'])
               userTransactions.push(transaction);
        })
        res.send(userTransactions);
      }
      else
         res.send({ message: "No transactions found" })
   });
})
app.post('/saveTransaction', function (req, res) {
   fs.readFile(__dirname + "/" + "transactions.json", 'utf8', function (err, data) {
      data = JSON.parse(data);
      var isReferenceNumberExists = true;
      var today = new Date();
      var date = today.getFullYear() + "" + (today.getMonth() + 1) + "" + today.getDate();
      var referenceNumber = "CUS" + date + Math.floor(Math.random() * (9999 - 1111) + 1111);
      while (isReferenceNumberExists) {
         if (data.length > 0) {
            data.some(transaction => {
               if (transaction.referenceNumber == referenceNumber) {
                  isReferenceNumberExists = true;
                  return true;
               } else
                  isReferenceNumberExists = false;
            })
            if (isReferenceNumberExists)
               referenceNumber = "CUS" + date + Math.floor(Math.random() * (9999 - 1111) + 1111);
         } else
            isReferenceNumberExists = false;
      }
      req.body.referenceNumber = referenceNumber;
      data.push(req.body);
      fs.writeFile(__dirname + "/" + "transactions.json", JSON.stringify(data), (err) => {
         if (err) {
            res.send({ message: "Unable to save transaction", statusCode: 400 });
            return;
         }
      });
      res.send({ message: "Transaction saved successfully with Reference id " + referenceNumber, statusCode: 200 })
   });
})
app.get('/:id', function (req, res) {
   fs.readFile(__dirname + "/" + "transactions.json", 'utf8', function (err, data) {
      var transactions = JSON.parse(data);
      var result = transactions.filter(transaction => transaction.referenceNumber == req.params['id']);
      if (result.length > 0)
         res.send({ data: result, statusCode: 200 });
      else
         res.send({ message: "No transaction data found with given reference number", statusCode: 400 });
      if (err) {
         res.send({ message: "Unable to get transaction", statusCode: 500 });
         return;
      }
   });
})
app.post('/saveUser', function (req, res) {
   fs.readFile(__dirname + "/" + "users.json", function (err, data) {
      var isUserIdExist = true;
      var isUserNameExist = false;
      var users = JSON.parse(data);
      var userId = "USR" + Math.floor(Math.random() * (999 - 111) + 111);
      while (isUserIdExist) {
         if (users.length > 0) {
            users.some(user => {
               if (user.userId == userId) {
                  isUserIdExist = true;
                  return true;
               } else
                  isUserIdExist = false;
            })
            if (isUserIdExist)
               userId = "USR" + Math.floor(Math.random() * (999 - 111) + 111);
         } else
            isUserIdExist = false;
      }
      req.body.userId = userId;
      users.some(user => {
         if (user.userName == req.body.userName)
            isUserNameExist = true;
      });
      if (isUserNameExist) {
         res.send({ message: "User Name exists", statusCode: 400 })
      } else {
         users.push(req.body);
         fs.writeFile(__dirname + "/" + "users.json", JSON.stringify(users), (err) => {
            if (err) {
               res.send({ message: "Unable to save user", statusCode: 500 });
               return;
            }
         });
         res.send({ message: "User Registred with userId : " + userId, statusCode: 200 })
      }
   })
})
app.post('/getUser', function (req, res) {
   fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
      var users = JSON.parse(data);
      var result = users.filter(user => user.userName == req.body.userName && user.password == req.body.password);
      if (result.length > 0)
         res.send({ data: result[0], statusCode: 200 });
      else
         res.send({ message: "No user data found with given credentials ", statusCode: 400 });
      if (err) {
         res.send({ message: "Unable to get user data", statusCode: 500 });
         return;
      }
   });
});
app.get('/user/getAllUsers', function (req, res) {
   fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
      if (err) {
         res.send({ message: "Unable to get user data", statusCode: 500 });
         return;
      }
      var users = JSON.parse(data);
      res.send({ data: users });
   });
})
app.post('/user/updatePermissions', function (req, res) {
   fs.readFile(__dirname + "/" + "users.json", 'utf8', function (err, data) {
      if (err) {
         res.send({ message: "Unable to update permissions", statusCode: 500 });
         return;
      }
      var users = JSON.parse(data);
      req.body.some(body => {
         users.some(user => {
            if (user.userId == body.userId) {
               user.addTransactionAccess = body.addTransactionAccess;
               user.viewTransactionAccess = body.viewTransactionAccess;
               return true;
            } else
               return false
         })
      })
      fs.writeFile(__dirname + "/" + "users.json", JSON.stringify(users), (err) => {
         if (err) {
            res.send({ message: "Unable to update petmissons", statusCode: 500 });
            return;
         }
      });
      res.send({ data: users });
   });
})
app.get("/getCustomerdata/:customerId", function (req, res) {
   var customerFound = false;
   fs.readFile(__dirname + "/" + "customerInfo.json", 'utf8', function (err, data) {
      if (err) {
         res.send({ message: "Unable to get customer data", statusCode: 500 });
         return;
      }
      var customers = JSON.parse(data);
      if (customers.length > 0) {
         customers.forEach(customer => {
            if (customer.customerNumber == req.params['customerId']) {
               customerFound = true;
               res.send({ data: customer, statusCode: 200 });
               return;
            }
         })
         if (!customerFound)
            res.send({ message: "No customer found with given ID", statusCode: 400 });
      } else
         res.send({ message: "No customer found with given ID", statusCode: 400 });
   });
})
var server = app.listen(8081, function () {
   var port = server.address().port
   console.log("app listening at",port)
})