Olymp.angJS.controller('mainController',[ '$http','$scope','$rootScope','$timeout','InitService',
  function($http,$scope,$rootScope,$timeout,InitService){

'use strict';
  InitService.addEventListener('ready', function () {
    // DOM ready
    console.log('mainController: ok, DOM ready');

      });

  var Ctrl = this;

 if ((!localStorage["OlympPass"]) ||(localStorage["OlympPass"]=="")) {
  Olymp.fw7.app.loginScreen();

 }
 else {

 };

this.allDealers = [];

this.DropSelected = {
  'id': "",
  'name': "",
  'city': "",
  'address': ""
};

this.phone = "";

this.user = {"profile_id":145,
"phone_mobile":null,
"email":null,
"dealer":{"name":null,"city":null,"address":null},
"full_name":null,
"first_name":null,
"last_name":null,
"middle_name":null,
"balance":0,
"created_at": null,
"parcel_blocked_at":null,
"blocking_reason":null};


/*---------DROPDOWNS------------*/

this.DropDealer = Olymp.fw7.app.autocomplete({
    input: '#dropdown_dealer',
    openIn: 'dropdown',
    onChange: function(autocomplete, value){
      Ctrl.DropSelected.name = value;
      //erase next fields
      Ctrl.DropSelected.city = null;
      Ctrl.DropSelected.address = null;
      //check if city is unique
      var uniqueCheck = $.grep(Ctrl.allDealers, function(e){return (value==e.dealer_name)});
      if (!uniqueCheck[1]) {
        Ctrl.DropSelected.city = uniqueCheck[0].city;
        //check if address is unique
        var uniqueCheck2 = $.grep(Ctrl.allDealers, function(e){return ((Ctrl.DropSelected.name==e.dealer_name)&&(Ctrl.DropSelected.city==e.city))});
        if (!uniqueCheck2[1]) {Ctrl.DropSelected.address = uniqueCheck2[0].address;};
      };
      Ctrl.refresh();
    },
    source: function (autocomplete, query, render) {
        var results = [];

        for (var i = 0; i < Ctrl.allDealers.length; i++) {
          var match = $.grep(results, function(e){return (e==Ctrl.allDealers[i].dealer_name)});
            if (!match[0]) {results.push(Ctrl.allDealers[i].dealer_name)};
        };
        render(results);
    }
});

this.DropCity = Olymp.fw7.app.autocomplete({
    input: '#dropdown_city',
    openIn: 'dropdown',
    onChange: function(autocomplete, value){
      Ctrl.DropSelected.city = value;
      Ctrl.DropSelected.address = null;
      //check if address is unique
      var uniqueCheck = $.grep(Ctrl.allDealers, function(e){return ((Ctrl.DropSelected.name==e.dealer_name)&&(value==e.city))});
      if (!uniqueCheck[1]) {Ctrl.DropSelected.address = uniqueCheck[0].address};
      Ctrl.refresh();
    },

    source: function (autocomplete, query, render) {
        var results = [];
        for (var i = 0; i < Ctrl.allDealers.length; i++) {
            if (Ctrl.allDealers[i].dealer_name==Ctrl.DropSelected.name){
              var match = $.grep(results, function(e){return (e==Ctrl.allDealers[i].city)});
            if (!match[0]) {results.push(Ctrl.allDealers[i].city)};
            }
        };

        render(results);
    }
});

this.DropAddress = Olymp.fw7.app.autocomplete({
    input: '#dropdown_address',
    openIn: 'dropdown',
    onChange: function(autocomplete, value){
      Ctrl.DropSelected.address = value;
      for (var i = 0; i < Ctrl.allDealers.length; i++) {
            if ((Ctrl.allDealers[i].dealer_name==Ctrl.DropSelected.name)&&(Ctrl.allDealers[i].address==value)){
                Ctrl.DropSelected.id = Ctrl.allDealers[i].id;
                return;
            }
        };

    },
    source: function (autocomplete, query, render) {
        var results = [];
        for (var i = 0; i < Ctrl.allDealers.length; i++) {
            if ((Ctrl.allDealers[i].dealer_name==Ctrl.DropSelected.name)&&(Ctrl.allDealers[i].city==Ctrl.DropSelected.city)){
                results.push(Ctrl.allDealers[i].address);
            }
        };

        render(results);
    }
});



this.refresh = function() {
$timeout(function () {
    $scope.$apply();
    },50);
};

/*-----------REST API------------*/
  var req = {
   method: 'POST',
   url: 'http://olympus.msforyou.ru/profiles/api/auth/register-info',
   headers: {
       'Content-Type': 'application/json'
     }
    };
  $http(req).then(

    function successCallback(response){
      Ctrl.allDealers = response.data.dealers;
      console.log(response);
    }, 
    function errorCallback(response){
  console.log(response);
    });



this.PullLoginForm = function () {
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var loginfo = Olymp.fw7.app.formToJSON('#login-form');
  console.log(loginfo);

  var req = {
   method: 'POST',
   url: 'http://olympus.msforyou.ru/profiles/api/auth/login',
   headers: {
       'Content-Type': 'application/json'
     },
     data: loginfo
    };

  $http(req).then(

    function successCallback(response){
        Olymp.fw7.app.hidePreloader();
      Olymp.fw7.app.alert("Авторизация прошла успешно!", function () {Olymp.fw7.app.closeModal();});
/*      localStorage["OlympPhone"] = loginfo.phone;
      localStorage["OlympPass"] = loginfo.password;*/
      Ctrl.user = response.data.profile;
      
      console.log(response);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });



};

this.SendSMS = function () {
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var loginfo = Olymp.fw7.app.formToJSON('#pre-reg-form');
  console.log(loginfo);
  this.phone=loginfo.phone;
  var req = {
   method: 'POST',
   url: 'http://olympus.msforyou.ru/profiles/api/auth/token',
   headers: {
       'Content-Type': 'application/json'
     },
     data: loginfo
    };

  $http(req).then(

    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
/*      Ctrl.testToken = response.data.token;*/
      Olymp.fw7.app.prompt("Введите присланный код", " ",
        function(code){
          if (code==response.data.token){
/*              Olymp.fw7.app.closeModal();*/
               Olymp.fw7.app.popup(".reg");
               Olymp.fw7.app.closeModal(".pre-reg");
          }
          else{
            Olymp.fw7.app.alert("Убедитесь в правильности введённого кода!");
          };
        }, 
        function(){
          
        })

      console.log(response);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
}


this.Register = function(){
Olymp.fw7.app.showPreloader(["Подождите..."]);
  var reginfo = Olymp.fw7.app.formToJSON('#reg-form');
  if (reginfo.agreeWithTerms[0]) reginfo.agreeWithTerms=1;
  if (reginfo.allowPersonalDataProcessing[0]) reginfo.allowPersonalDataProcessing=1;
  reginfo.phone_mobile_local = this.phone;
  reginfo.dealer_id = Ctrl.DropSelected.id;
  console.log(reginfo);
  var req = {
   method: 'POST',
   url: 'http://olympus.msforyou.ru/profiles/api/auth/register',
   headers: {
       'Content-Type': 'application/json'
     },
     data: reginfo
    };

  $http(req).then(

    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      Olymp.fw7.app.alert("Регистрация прошла успешно!", function () {Olymp.fw7.app.closeModal();});
/*    localStorage["OlympPhone"] = loginfo.phone;
      localStorage["OlympPass"] = loginfo.password;*/
      Ctrl.user = response.data.profile;

      console.log(response);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });

}


this.Logout = function () {
      localStorage["OlympPhone"] = "";
      localStorage["OlympPass"] = "";
      Olymp.fw7.app.loginScreen();
}



}]);