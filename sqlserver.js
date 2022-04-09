require('dotenv').config()
var express = require('express');
var app = express();
var conn = require("./connect")();
var sql = require("mssql");


app.get("/api/fcm/getdevice", function(req , res){
	getDevices()
});

 function getdevice() {
     // Since database calls are async in NodeJS thus using promises.
    return new Promise ( (resolve, reject) => {
    conn.connect().then(function () {
        console.log("inside send notification getdevice sql call");
        var request = new sql.Request(conn);
        let sp_query = "exec sp_sendnotification_to_seeker_newpost";
        request.query(sp_query).then(function (resp) {
          console.log("response......");
            console.log(resp.json);
            conn.close();
          return resolve(resp);
        }).catch(function (err) {
            console.log(err);
            conn.close();
          return reject(err);
        });
    }).catch(function (err) {
        console.log(err);
        conn.close();
       return reject(err);
    });
});
}

module.exports.getdevice = getdevice;

function getuserdevice(req) {
  // Since database calls are async in NodeJS thus using promises.
 return new Promise ( (resolve, reject) => {
 conn.connect().then(function () {
     console.log("inside getdevice sql call");
     var request = new sql.Request(conn);
     let sp_query = "exec sp_getDeviceInfromation @userId=" + req + ";";
     console.log("Query:" + sp_query);
     request.query(sp_query).then(function (resp) {
       console.log("Response received from getdevice stored proc");
         conn.close();
       return resolve(resp);
     }).catch(function (err) {
         console.log(err);
         conn.close();
       return reject(err);
     });
 }).catch(function (err) {
     console.log(err);
     conn.close();
    return reject(err);
 });
});
}

module.exports.getuserdevice = getuserdevice;

function insertNewPostDataNotification(req) {
    // Since database calls are async in NodeJS thus using promises.
  // return new Promise ( (resolve, reject) => {
   conn.connect().then(function () {
       var request = new sql.Request(conn);
       let sp_query = "sp_insert_seeker_newpost_sent @postId=" + req.postid +
                         ", @receiver_userid=" + req.receiver_userid + ", @deviceid='" + req.deviceid +
                          "', @message_sent=" + req.message_sent+
                           ", @response ='" +req.response +"', @notificationType='"+
                            req.notificationType +"', @posted_by_Id=" + req.posted_by_Id+",@receivername='"+
                            req.receivername + "';";
    
       console.log(sp_query);
       request.query(sp_query).then(function (resp) {
          // console.log(resp.json);
           conn.close();
           return resp;
        // return resolve(resp);
       }).catch(function (err) {
           console.log(err);
           conn.close();
           return err;
         //return reject(err);
       });
   }).catch(function (err) {
       console.log(err);
       return err;
     // return reject(err);
   });
//});
}
module.exports.insertNewPostDataNotification = insertNewPostDataNotification;

function getRatingNotification() {
  // Since database calls are async in NodeJS thus using promises.
 return new Promise ( (resolve, reject) => {
 conn.connect().then(function () {
     console.log("inside send notification Rating call");
     var request = new sql.Request(conn);
     let sp_query = "exec sp_getRatingNotifications";
     request.query(sp_query).then(function (resp) {
        // console.log(resp.json);
         conn.close();
       return resolve(resp);
     }).catch(function (err) {
         console.log(err);
         conn.close();
       return reject(err);
     });
 }).catch(function (err) {
     console.log(err);
    return reject(err);
 });
});
}

module.exports.getRatingNotification = getRatingNotification;

