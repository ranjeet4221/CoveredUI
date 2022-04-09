var apn = require('apn');
//var rparam = require('./rating/ratingcontroller');
var device = require("./sqlserver");

exports.setToken = function(req, res, next) {
  var user = req.user;
  user.apn_token = req.body.token;
  user.save(function(err) {
    if (err) { return next(err) }
    return res.json({success: "true"});
  })
}

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

function getrparam(sent,rsp,obj,nType){
    var deviceid = obj.deviceId;
    var userid = obj.userid;
    var receivername =obj.receivername;
    if (obj !=null){
        var paramsObject = { postid:obj.postid, receiver_userid:userid,
            deviceid: deviceid,message_sent: sent,response: rsp,notificationType: nType,
            posted_by_Id: obj.posted_by_Id, receivername: receivername };
        return paramsObject;
    }
    return null;
}


exports.sendNotification = function(token, notificationtype,sendername,ratingstar,
                                     postid, obj, deviceId) {
try{
    var service = new apn.Provider({
    //  pfx:  './certs/mSitteriosPushDevAPNS.p12',
      pfx:  './certs/mSitterApns.p12',
      passphrase: null, 
      production: true
    });
    
      var note = new apn.Notification();
      note.expiry = Math.floor(Date.now() / 1000) + 60; // Expires 1 minute from now.
      note.badge = 1;
      note.sound = "ping.aiff";
      note.topic="com.kisjay.msitter";

      console.log("obj is:" + obj);
      
    switch (notificationtype) {
      case 'RATING_RECEIVED':
          note.alert =  sendername + " gave " + ratingstar + "  rating to you.";
          note.payload = {'data' : {'keyword': 'RATING', 'postid': postid.toString() }};
          break;
      case 'APPLIED':
          note.alert = sendername + " has responded to your post.";
      note.payload = {'data' : {'keyword': 'POST', 'postid': postid.toString() }};
          break;
      case 'ACCEPTED':
          note.alert = sendername + " has shown interest in your post.";
          note.payload = {'data' : {'keyword': 'POST', 'postid': postid.toString() }};
          break;
      case 'SHARED':
            note.alert = sendername + " has shared a post with you.";
            note.payload = {'data' : {'keyword': 'POST', 'postid': postid.toString()}};
            break;
       case 'HIRED':
              note.alert = "Congratulation! you have been hired by " + sendername;
              note.payload = {'data' : {'keyword': 'POST', 'postid': postid.toString() }};
              break;
        case 'COMPLETED':
                note.alert = "Congratulation! your current job has been ended. Rate Now.";
                note.payload = {'data' : {'keyword': 'POST', 'postid': postid.toString() }};
                break;
        case 'RATING':
                  note.alert = "Action Required - Rating Pending.";
                  note.payload = {'data' : {'keyword': 'POST', 'postid': postid.toString() }};
                  break;
        default:
          console.log("Sorry, we are out of ${expr}.");
      }

     // note.alert = "New Job Posted -" + title;
     // note.payload = {'data' : {'keyword': 'NEWPOST', 'postid': postid.toString(), 'postbyid': post_by_id.toString() }};
      note.pushType = "alert";
    
      service.send(note, token).then( (result,err) => {
        console.log("result:", result);
        console.log("err:", err);
        if(err) { 
            console.log(JSON.stringify(err));
            console.log('message failed');
            var param =  getparam(1,'FAILED',obj,notificationtype, deviceId);
            device.insertNewPostDataNotification(param);
        }
        else {
            console.log(JSON.stringify(result));
            console.log('message sent');
            var param = getparam(1,'SUCCESS',obj,notificationtype, deviceId);
            device.insertNewPostDataNotification(param);
        }
      });
    }
    catch(e){
      console.log("Error while sending notification to IOS- "+ e + " token-"+ token);
    }
/* 
    var apnConnection = new apn.Connection(options);

    var myDevice = new apn.Device(token);

    var note = new apn.Notification();

    note.expiry = Math.floor(Date.now() / 1000) + 3600;
    note.badge = 1;
    note.sound = "default";
    note.alert = "\uD83D\uDCE7 \u2709 You have a new message";
    note.payload = {'messageFrom': 'Caroline'};
    apnConnection.pushNotification(note, myDevice);

    return res.json({success: "true"}); */
 // });
}

exports.sendRatingNotification = function(token, postid, post_by_id, title,obj) {
    try{
        var service = new apn.Provider({
        //  pfx:  './certs/mSitteriosPushDevAPNS.p12',
          pfx:  './certs/mSitterApns.p12',
          passphrase: null, 
          production: true
        });
        
          var note = new apn.Notification();
          note.expiry = Math.floor(Date.now() / 1000) + 60; // Expires 1 minute from now.
          note.badge = 1;
          note.sound = "ping.aiff";
          note.alert = "Action Required, Rating Pending for -" + title;
          note.payload = {'data':{'keyword': 'RATING_PENDING', 'postid': postid.toString(), 'postbyid': post_by_id.toString()} };
          note.pushType = "alert";
          note.topic="com.kisjay.msitter";
        
          service.send(note, token).then( (result,err) => {
            if(err) { 
                console.log(JSON.stringify(err));
                var param =  getrparam(1,'FAILED',obj,'RATING_PENDING');
                device.insertNewPostDataNotification(param);
            }
            else {
                console.log(JSON.stringify(result));
                var param = getgetrparamparam(1,'SUCCESS',obj,'RATING_PENDING');
                device.insertNewPostDataNotification(param);
            }
          });
        }
        catch(e){
          console.log("Error while sending notification to IOS- "+ e + " token-"+ token);
        }
    }