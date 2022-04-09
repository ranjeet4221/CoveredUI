var express = require('express');
var router = express.Router();
var sql = require("mssql");
var conn = require("./connect")();
var device = require("./sqlserver");
var admin = require("firebase-admin");
var serviceAccount = require("./mesitter-firebase-key.json");
var ios = require("./apns-notification");
var ios_apn = require("./ios-apns-notification");
var common = require("./common");

function getAlert(notificationtype, sendername,ratingstar) {
    switch (notificationtype) {
        case 'RATING_RECEIVED':
            return  sendername + " gave " + ratingstar + "  rating to you.";
            break;
        case 'APPLIED':
            return sendername + " has responded to your post.";
            break;
        case 'ACCEPTED':
            return sendername + " has shown interest in your post.";
            break;
        case 'SHARED':
            return sendername + " has shared a post with you.";
              break;
         case 'HIRED':
            return "Congratulation! you have been hired by " + sendername;
                break;
          case 'COMPLETED':
                  return "Congratulation! your current job has been ended. Rate Now.";
                  break;
          case 'RATING':
                    return "Action Required - Rating Pending.";
                    break;
          default:
            console.log("Sorry, we are out of ${expr}.");
        }
}

module.exports.getAlert = getAlert;

function getPayload(notificationtype, postid) {
    switch (notificationtype) {
        case 'RATING_RECEIVED':
            return  {'keyword': 'RATING', 'postid': postid.toString() };
            break;
        case 'APPLIED':
       
        return {'keyword': 'POST', 'postid': postid.toString() };
            break;
        case 'ACCEPTED':
           
            return  {'keyword': 'POST', 'postid': postid.toString() };
            break;
        case 'SHARED':
             
            return  {'keyword': 'POST', 'postid': postid.toString()};
              break;
         case 'HIRED':
              
            return {'keyword': 'POST', 'postid': postid.toString() };
                break;
          case 'COMPLETED':
               
            return  {'keyword': 'POST', 'postid': postid.toString() };
                  break;
          case 'RATING':
                   
            return  {'keyword': 'POST', 'postid': postid.toString() };
                    break;
          default:
            console.log("Sorry, we are out of ${expr}.");
        }
}

module.exports.getPayload = getPayload;

function getparam(sent,rsp,obj,nType, deviceId){
    if (obj !=null){
        var paramsObject = { postid:obj.postid, receiver_userid: obj.receiver_userId,
            deviceid: deviceId,message_sent: sent,response: rsp,notificationType: nType,
            posted_by_Id: obj.postedbyid, sender_id: obj.sender_id, sendername: obj.sendername,
            receivername: obj.receivername };
        return paramsObject;
    }
    return null;
}
module.exports.getparam = getparam;

function sendnotifcationstodevices(req){
    device.getuserdevice(req.body.receiver_userId)
    .then (result => {    // When getDevices will resolve promise will be in then.
    result.recordset.forEach(function(obj) { 
        console.log(obj.DeviceId); 
        console.log(obj.Firebasetoken); 
        if (obj.Firebasetoken.length == 64){
            console.log('sending to ios device');
            ios_apn.sendNotification(obj.Firebasetoken,
                req.body.notificationtype,
                req.body.sendername,
                req.body.ratingstar,
                req.body.postid,
                req.body, obj.Firebasetoken);
        } else {
            triggerfcm(obj.Firebasetoken, req.body.notificationtype,
                req.body.sendername,
                req.body.ratingstar,
                req.body.postid,
                req.body,obj.DeviceId);
        }
        });
    })
    .catch(err => {        // If promise is rejected then on catch
        console.log(err.message);
    });
}

module.exports.sendnotifcationstodevices = sendnotifcationstodevices;


function checkFunction(){
    return 4;
}
module.exports.checkFunction = checkFunction;


function triggerfcm(registrationToken,notificationtype,sendername,ratingstar,postid,obj,deviceId ){
    try{
    console.log("inside trigger fcm method.");
    console.log(postid);
    var param =null;
   // var registrationToken = "ca8fZBj4Uoc:APA91bF0PRfLuBBqXKFuJYrR265nW7z80aSRfSF2Vwr0KleHxvtG8OL-fANia5V-0VsJKJlUWGL6nnjmyVqB_N-rq177Wvfstx2fBrsZUoQzvztfNSbE48iUOITAwQCquwjS7jtJgCbE";
    var payload = {
        notification: {
          title: common.getAlert(notificationtype,sendername,ratingstar),
          body: "View for more details."
        },
        data: common.getPayload(notificationtype,postid)
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
            param = common.getparam(1,'FAILED',obj,notificationtype, deviceId);
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                failedTokens.push(registrationTokens[idx]);
              }
            });
        } else {
          
             param = common.getparam(1,'SUCCESS',obj,notificationtype, deviceId);
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