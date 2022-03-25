const FCM = require('fcm-node');
var serverKey = 'AAAAd_YGCYA:APA91bH_SVPaA3TrkkXt-rUjzCGra4PXRsM9Rpth8YikU_Z4_L6GUcScPHsmwUIFE80uDqBSZouI-G9egU5EMYFan7veVQmwMJjlKDcCYO2c9GxtchWPVgcogIg04jVawHFO6LF2Xvmo'; //put your server key here
var fcm = new FCM(serverKey);

module.exports = {

    pushNotification(notification, firebaseToken) {
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: firebaseToken,
            notification: {
                title: notification.title,
                body: notification.message,
            },
            data: { //you can send only notification or only data(or include both)
                my_key: 'my value',
                my_another_key: 'my another value'
            }
        };

        fcm.send(message, function (err, response) {
            if (err) {
                console.log(err)
                console.log("Something has gone wrong!");
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
    }
}