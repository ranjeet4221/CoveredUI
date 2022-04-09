var express = require('express');
var router = express.Router();
var sql = require("mssql");
var conn = require("../connect")();
var sqlhelper = require("../sqlserver");
var admin = require("firebase-admin");
var serviceAccount = require("../mesitter-firebase-key.json");
var ios = require("../apns-notification");

  
  var seeker_registrationToken = {};
  var provider_registrationToken = {};
  var registrationToken ='';
  var map = new Map();
var ratings = function (req, res) {
        console.log("entered inside rating controller");
        sqlhelper.getRatingNotification()
        .then (result => {    
          console.log("rating sp resultset:");
          console.log(result.recordset)  ;
          result.recordset.forEach(function(obj) { 
              console.log(obj.provider_firebasetoken); 
              console.log(obj.seeker_firebasetoken); 
            //  console.log(obj.provider_Rating);
              map.set('Id', obj);
              if ((obj.provider_Rating==null || obj.provider_Rating==0) && 
                obj.provider_firebasetoken!=null){
                    registrationToken = obj.provider_firebasetoken;
                    map.set('deviceId', obj.provider_deviceId);
                    map.set('userid', obj.provider_Id);
                    map.set('receivername', obj.provider_name);
                    map.set('Id', obj);
                    if (obj.provider_firebasetoken.length == 64){
                      ios.sendRatingNotification(obj.provider_firebasetoken,getparamval('POSTID'),
                                    getparamval('POST_BY_ID'),obj.title);
                    } else {
                        triggerfcm();
                    }
                    // provider_registrationToken[obj.postid] = new Array();;
                    // provider_registrationToken[obj.postid] = obj;
              }
             // registrationToken.push(obj.provider_firebasetoken);
              if ((obj.seeker_rating ==null || obj.seeker_rating ==0) && 
                obj.seeker_firebasetoken!=null){
                    registrationToken = obj.seeker_firebasetoken;
                    map.set('deviceId', obj.seeker_deviceId);
                    map.set('userid', obj.seeker_Id);
                    map.set('receivername', obj.seeker_name);
                    if (obj.provider_firebasetoken.length == 64){
                      ios.sendRatingNotification(obj.provider_firebasetoken,getparamval('POSTID'),
                                    getparamval('POST_BY_ID'),obj.title, obj);
                    } else {
                      triggerfcm();
                    }
                   
                    // seeker_registrationToken[obj.postid] = new Array();;
                    // seeker_registrationToken[obj.seeker_deviceId] = obj;
              }
              
             
             
            });
           // res.json(result.recordset);
        })
        .catch(err => {      
            res.json({
                SQLResp: 'Query err',
                result: err
            });
        });
    }
    module.exports.ratings = ratings;
    function getparam(sent,rsp,nType){
        var obj = map.get('Id');
        var deviceid = map.get('deviceId');
        var userid = map.get('userid');
        var receivername = map.get('receivername');
        if (obj !=null){
            var paramsObject = { postid:obj.postid, receiver_userid:userid,
                deviceid: deviceid,message_sent: sent,response: rsp,notificationType: nType,
                posted_by_Id: obj.posted_by_Id, receivername: receivername };
            return paramsObject;
        }
        return null;
    }


    function getparamval(param){
        var obj = map.get('Id');
        if (param == 'POSTID'){
            return obj.postid;
        } else if (param == 'TITLE'){
            return obj.job_title;
        }else if (param == 'POST_BY_ID'){
          return obj.posted_by_Id;
      }
    }

    function triggerfcm(){
      try
      {
        console.log("inside rating trigger fcm method");
        var postid = getparamval('POSTID');
        var title = getparamval('TITLE');
        var post_by_id = getparamval('POST_BY_ID');
        console.log(postid);
        var param =null;
       // var registrationToken = "ca8fZBj4Uoc:APA91bF0PRfLuBBqXKFuJYrR265nW7z80aSRfSF2Vwr0KleHxvtG8OL-fANia5V-0VsJKJlUWGL6nnjmyVqB_N-rq177Wvfstx2fBrsZUoQzvztfNSbE48iUOITAwQCquwjS7jtJgCbE";
        var payload = {
            notification: {
              title: "Action Required      ",
              body: "Rating Pending for " + title.toString()
            },
            data: {
              keyword: "RATING_PENDING",
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
              
                 param = getparam(1,'SUCCESS','RATING_PENDING');
                 console.log(param);
            }
                sqlhelper.insertNewPostDataNotification(param);
          })
          .catch(function(error) {
            console.log("Error sending message:", error);
          });
        }
        catch(e){
            console.log("exception in ratingcontroller" + e );
        }
    }

  
