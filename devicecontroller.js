var express = require('express');
var router = express.Router();
var sql = require("mssql");
var conn = require("./connect")();
var device = require("./sqlserver");
var admin = require("firebase-admin");
var serviceAccount = require("./mesitter-firebase-key.json");
var ios = require("./apns-notification");
var common = require("./common");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

var registrationToken = [];
var map = new Map();

var routes = function () {
    router.route('/')
    .get(function (req, res) {
        console.log("entered inside sendmessagetoall");
        device.getdevice()
        .then (result => {    // When getDevices will resolve promise will be in then.
          
          // console.log("result.....");
          // var obj = result.json(result);
           // console.log(obj);
          result.recordset.forEach(function(obj) { 
            //console.log(obj);
              console.log(obj.JobSeekerId); 
              console.log(obj.FirebaseToken); 
              console.log(obj.title);
              registrationToken.push(obj.FirebaseToken);
              map.set('Id', obj);
              map.set('title', obj.title);
              if (obj.FirebaseToken.length == 64){
                  console.log('sending to ios device');
                  ios.sendNotification(obj.FirebaseToken,
                    getparamval('POSTID'), getparamval('POST_BY_ID'), obj.title,obj);
              } else {
                    triggerfcm();
              }
             
            });
          //  let resp = result.recordSet;
          //console.log(result.length);
            // for (let i = 0, len = result.length; i < len; i++) {
            //     console.log(result[i]);
            //    // console.log(resp[i].userId + " by " + resp[i].firebaseToken);
            // }
          
            res.json(result.recordset);
           
            /* res.json({
                SQLResp: 'Query succes',
                result: result
            }); */
        })
        .catch(err => {        // If promise is rejected then on catch
            res.json({
                SQLResp: 'Query err',
                result: err
            });
        });
    });

    router.route('/updatehirestatus')
    .post(function (req, res) {
        conn.connect().then(function () {
            //var transaction = new sql.Transaction(conn);
            //transaction.begin().then(function () {
                console.log("inside updatehirestatus method");
                var request = new sql.Request(conn);
                request.input("Jobpost_Id", sql.BigInt, req.body.Jobpost_Id)
                request.input("Seeker_Id", sql.BigInt, req.body.Seeker_Id)
                request.input("Is_Hired", sql.VarChar(50), req.body.Is_hired)
                request.execute("sp_UpdatePostStatus").then(function () {
                   // transaction.commit().then(function (recordSet) {
                        conn.close();
                        // console.log(req);
                        // Notifiction sendign method from common .js file
                        common.sendnotifcationstodevices(req);
                        // Notification Done

                        // Response sendign to User requestign for the method
                        res.status(200).send(req.body);
                        // Response Done
                        
                    }).catch(function (err) {
                        conn.close();
                        res.status(400).send(err.message);
                    });
                }).catch(function (err) {
                    conn.close();
                    res.status(400).send("Error while inserting data");
                });
    });


    router.route('/submitreviews')
    .post(function (req, res) {
        conn.connect().then(function () {
            //var transaction = new sql.Transaction(conn);
            //transaction.begin().then(function () {
                var request = new sql.Request(conn);
                request.input("user_id", sql.BigInt, req.body.User_id)
                request.input("reviewer_Id", sql.BigInt, req.body.Reviewer_id)
                request.input("reviewer_name", sql.VarChar(150), req.body.Reviewer_name)
                request.input("ratings", sql.Int, req.body.Ratings)
                request.input("review_desc", sql.VarChar(500), req.body.Review_desc)
                request.input("review_options", sql.VarChar(500), req.body.review_options)
                request.input("post_id", sql.BigInt, req.body.Post_Id)
                request.execute("sp_SubmitReviews").then(function () {
                    //transaction.commit().then(function (recordSet) {
                        conn.close();
                        
                        // Notifiction sendign method from common .js file
                        common.sendnotifcationstodevices(req);
                        // Notification Done

                        // Response sendign to User requestign for the method
                        res.status(200).send(req.body);
                        // Response Done
                        
                    }).catch(function (err) {
                        conn.close();
                        res.status(400).send(err.message);
                    });
                }).catch(function (err) {
                    conn.close();
                    res.status(400).send("Error while inserting data");
                });
    });

    router.route('/favjobs')
    .post(function (req, res) {
        conn.connect().then(function () {
           
                var request = new sql.Request(conn);
                request.input("User_Id", sql.BigInt, req.body.User_Id)
                request.input("Jobpost_Id", sql.NVarChar, req.body.Job_Id)
                request.input("Is_Saved", sql.Bit, req.body.Is_Saved)
                request.input("Is_Applied", sql.Bit, req.body.Is_Applied)
                request.input("Is_Hired", sql.Bit, req.body.Is_Hired)
                request.input("Is_Shared", sql.Bit, req.body.Is_Shared)
                request.input("Is_Accepted", sql.Bit, req.body.Is_Accepted)
                request.input("Is_Rejected", sql.Bit, req.body.Is_Rejected)
                request.input("Is_Completed", sql.Bit, req.body.Is_Completed)
                request.input("Notes", sql.VarChar(500), req.body.Notes)
                request.execute("sp_SavedPost").then(function () {
                   // transaction.commit().then(function (recordSet) {
                        conn.close();
                        
                        // Notifiction sendign method from common .js file
                        common.sendnotifcationstodevices(req);
                        // Notification Done

                        // Response sendign to User requestign for the method
                        res.status(200).send(req.body);
                        // Response Done
                        
                    }).catch(function (err) {
                        conn.close();
                        res.status(400).send(err.message);
                    });
                }).catch(function (err) {
                    conn.close();
                    res.status(400).send("Error while inserting data");
                });
    });



   /*  router.route('/')
        .get(function (req, res) {
            conn.connect().then(function () {
                var sqlQuery = "SELECT * FROM Device";
                var req = new sql.Request(conn);
                req.query(sqlQuery).then(function (recordset) {
                    res.json(recordset.recordset);
                    conn.close();
                })
                    .catch(function (err) {
                        conn.close();
                        res.status(400).send("Error while fetching data");
                    });
            })
                .catch(function (err) {
                    conn.close();
                    res.status(400).send("Error while making connection:"+ err);
                });
        }); */

    router.route('/')
        .post(function (req, res) {
            conn.connect().then(function () {
                var transaction = new sql.Transaction(conn);
                transaction.begin().then(function () {
                    var request = new sql.Request(transaction);
                    request.input("ProductName", sql.VarChar(50), req.body.ProductName)
                    request.input("ProductPrice", sql.Decimal(18, 0), req.body.ProductPrice)
                    request.execute("Usp_InsertProduct").then(function () {
                        transaction.commit().then(function (recordSet) {
                            conn.close();
                            res.status(200).send(req.body);
                        }).catch(function (err) {
                            conn.close();
                            res.status(400).send("Error while inserting data");
                        });
                    }).catch(function (err) {
                        conn.close();
                        res.status(400).send("Error while inserting data");
                    });
                }).catch(function (err) {
                    conn.close();
                    res.status(400).send("Error while inserting data");
                });
            }).catch(function (err) {
                conn.close();
                res.status(400).send("Error while inserting data");
            });
        });


    router.route('/:id')
        .put(function (req, res) {
            var _productID = req.params.id;
            conn.connect().then(function () {
                var transaction = new sql.Transaction(conn);
                transaction.begin().then(function () {
                    var request = new sql.Request(transaction);
                    request.input("ProductID", sql.Int, _productID)
                    request.input("ProductPrice", sql.Decimal(18, 0), req.body.ProductPrice)
                    request.execute("Usp_UpdateProduct").then(function () {
                        transaction.commit().then(function (recordSet) {
                            conn.close();
                            res.status(200).send(req.body);
                        }).catch(function (err) {
                            conn.close();
                            res.status(400).send("Error while updating data");
                        });
                    }).catch(function (err) {
                        conn.close();
                        res.status(400).send("Error while updating data");
                    });
                }).catch(function (err) {
                    conn.close();
                    res.status(400).send("Error while updating data");
                });
            }).catch(function (err) {
                conn.close();
                res.status(400).send("Error while updating data");
            });
        });


        router.route('/:id')
        .delete(function (req, res) {
            var _productID = req.params.id;
            conn.connect().then(function () {
                var transaction = new sql.Transaction(conn);
                transaction.begin().then(function () {
                    var request = new sql.Request(transaction);
                    request.input("ProductID", sql.Int, _productID)
                    request.execute("Usp_DeleteProduct").then(function () {
                        transaction.commit().then(function (recordSet) {
                            conn.close();
                            res.status(200).json("ProductID:" + _productID);
                        }).catch(function (err) {
                            conn.close();
                            res.status(400).send("Error while Deleting data");
                        });
                    }).catch(function (err) {
                        conn.close();
                        res.status(400).send("Error while Deleting data");
                    });
                }).catch(function (err) {
                    conn.close();
                    res.status(400).send("Error while Deleting data");
                });
            })
        });

    return router;
};
module.exports = routes;

function getparam(sent,rsp,nType){
    var obj = map.get('Id');
    if (obj !=null){
        var paramsObject = { postid:obj.postid, receiver_userid: obj.JobSeekerId,
            deviceid: obj.deviceId,message_sent: sent,response: rsp,notificationType: nType,
            posted_by_Id: obj.posted_by_Id, name: obj.Name };
        return paramsObject;
    }
    return null;
}

function getparamval(param){
    var obj = map.get('Id');
    if (param == 'POSTID'){
        return obj.postid;
    }else if (param == 'POST_BY_ID'){
        return obj.posted_by_Id;
    }
}

function triggerfcm(){
    try{
    console.log("inside trigger fcm method");
    var title = map.get('title');
    var postid = getparamval('POSTID');
    var post_by_id = getparamval('POST_BY_ID');
    console.log(postid);
    var param =null;
   // var registrationToken = "ca8fZBj4Uoc:APA91bF0PRfLuBBqXKFuJYrR265nW7z80aSRfSF2Vwr0KleHxvtG8OL-fANia5V-0VsJKJlUWGL6nnjmyVqB_N-rq177Wvfstx2fBrsZUoQzvztfNSbE48iUOITAwQCquwjS7jtJgCbE";
    var payload = {
        notification: {
          title: "New Job Posted",
          body: title
        },
        data: {
          keyword: "NEWPOST",
          postid: postid.toString(),
          postbyid: post_by_id.toString()
        }
      };
    
      var options = {
        priority: "high",
        timeToLive: 60 * 60
      };
      admin.messaging().sendToDevice(registrationToken, payload, options)
      .then(function(response) {
        console.log("Successfully sent message:", response);
        if (response.failureCount > 0) {
            const failedTokens = [];
            param = getparam(1,'FAILED');
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                failedTokens.push(registrationTokens[idx]);
               
              }
            });
        } else {
          
             param = getparam(1,'SUCCESS','NEW_POST');
             console.log(param);
        }
            device.insertNewPostDataNotification(param);
      })
      .catch(function(error) {
        console.log("Error sending message:", error);
      });
    }
    catch(e){
        console.log("exception in devicecontroller" + e );
    }
}