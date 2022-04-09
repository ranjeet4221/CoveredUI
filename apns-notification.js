var apn = require('apn');
var rparam = require('./rating/ratingcontroller');
var device = require("./sqlserver");

exports.setToken = function(req, res, next) {
  var user = req.user;
  user.apn_token = req.body.token;
  user.save(function(err) {
    if (err) { return next(err) }
    return res.json({success: "true"});
  })
}

function getparam(sent,rsp,obj,nType){
    if (obj !=null){
        var paramsObject = { postid:obj.postid, receiver_userid: obj.JobSeekerId,
            deviceid: obj.deviceId,message_sent: sent,response: rsp,notificationType: nType,
            posted_by_Id: obj.posted_by_Id, name: obj.Name };
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


exports.sendNotification = function(token, postid, post_by_id, title, obj) {
try{
    var service = new apn.Provider({
     // pfx:  './certs/mSitteriosPushDevAPNS.p12',
      pfx:  './certs/mSitterApns.p12',
      passphrase: null, 
      production: true
    });
    
      var note = new apn.Notification();
      note.expiry = Math.floor(Date.now() / 1000) + 60; // Expires 1 minute from now.
      note.badge = 1;
      note.sound = "ping.aiff";
      note.alert = "New Job Posted -" + title;
      note.payload = {'data' : {'keyword': 'NEWPOST', 'postid': postid.toString(), 'postbyid': post_by_id.toString() }};
      note.pushType = "alert";
      note.topic = "com.kisjay.msitter";
    
      service.send(note, token).then( (result,err) => {
        console.log("result:", result);
        console.log("err:", err);
        if(err) { 
            console.log(JSON.stringify(err));
            console.log('message failed');
            var param =  getparam(1,'FAILED',obj,'NEW_POST');
            device.insertNewPostDataNotification(param);
        }
        else {
            console.log(JSON.stringify(result));
            console.log('message sent');
            var param = getparam(1,'SUCCESS',obj,'NEW_POST');
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
          //pfx:  './certs/mSitteriosPushDevAPNS.p12',
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
          note.topic = "com.kisjay.msitter";
        
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