var skipRegister = false, currentMain = 0, token = '', salt = CryptoJS.lib.WordArray.random(256/8), iv = CryptoJS.lib.WordArray.random(128 / 8), key = CryptoJS.PBKDF2('S3cr3t0..2016@@', salt, { iterations: 10, hasher:CryptoJS.algo.SHA256}), socket, liststores, mylat, mylon, validate = false;
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('app', ['ionic', 'ngCordova', 'ngCookies', 'app.controllers', 'app.routes', 'app.services', 'app.directives'])

/*.config( function($httpProvider){
    $httpProvider.defaults.xsrfCookieName = '_csrf';
    $httpProvider.defaults.xsrfHeaderName = 'Cookie';
})*/

.run(function($ionicPlatform, $cordovaLocalNotification, $cordovaGeolocation, $ionicLoading, $http, $cordovaDevice, $state, $cookies) {
  
  window.localStorage.clear();
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      //cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    //validate
    /*start valida el uuid y redirecciona a select*/
    var link = 'https://www.chocolatesublime.pe/validdevice', linkStors = 'https://www.chocolatesublime.pe/liststores';

    $http.get(linkStors).then(function (res){
      liststores = res.data;
    });

    var posOptions = {enableHighAccuracy: true, timeout: 20000, maximumAge: 0};

    $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
      mylat = position.coords.latitude;
      mylon = position.coords.longitude;
    });

    setInterval(function(){
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
        mylat = position.coords.latitude;
        mylon = position.coords.longitude;
      });
    }, 60000);
    
    $http.post(link, {
      uuid: $cordovaDevice.getUUID()
      }).then(function (res){
        if(res.data.response == 1){
          token = res.data.token;
          console.log(skipRegister);
          skipRegister = true;
          console.log(skipRegister);

          //map for notifications
          var ids = [], sound = 'file://sound/alertDonofrio.mp3';

          socket = io.connect('https://www.chocolatesublime.pe',{query: "token=" + token});

          socket.on('allClients', function(data) {
            $.each(data, function(){
              if(this.status == 1){
                var nlocate2 = Geohash.decode(this.locate);
                if(distance(nlocate2.lat, nlocate2.lon, mylat, mylon) <= 0.04 && !searchIds(ids, this.id)){
                  ids.push(this.id);
                  $cordovaLocalNotification.schedule({
                    id: 1,
                    title: 'D\'nofrio',
                    text: "Un heladero D\'nofrio está cerca de ti.",
                    sound: sound,
                    data: {
                      customProperty: 'custom value'
                    }
                  }).then(function (result) {
                    console.log('Notification 1 triggered');
                  });
                }
              }
            });
          });
        }
        validate = true;
    });
      /*end valida el uuid y redirecciona a select*/
  });
});

function distance(lat1,lon1,lat2,lon2){
  var p = 0.017453292519943295;    // Math.PI / 180
  var c = Math.cos;
  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
          c(lat1 * p) * c(lat2 * p) * 
          (1 - c((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

function searchIds(ids, id) {
  if(ids.length > 0){
    for(n = 0; n < ids.length; n++){
      if(ids[n] == id) return true;
    }
  }
  return false;
}

function toRad(x) {
  return x * Math.PI / 180;
}