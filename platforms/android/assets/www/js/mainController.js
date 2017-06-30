Olymp.angJS.controller('mainController',[ '$http','$scope','$rootScope','$timeout','InitService',
function($http,$scope,$rootScope,$timeout,InitService){
  'use strict';
  var Ctrl = this;

/*-----------Wait for DOM------------*/
  InitService.addEventListener('ready', function () {
    // DOM ready
    console.log('mainController: ok, DOM ready');

      });

/*-----------Some var-s for REST------------*/

this.REST_URL = "http://test.olympus.msforyou.ru/";

$http({method: 'GET', url: 'q.env'}).then(
  function(response) {
    Ctrl.Token = response.data;
    Ctrl.GetDealers();

        /*---Check if logged in---*/
       if ((!localStorage["OlympPass"]) ||(localStorage["OlympPass"]=="")) {
        Olymp.fw7.app.loginScreen();
       }
       else {
        var loginfo = {"phone":localStorage["OlympPhone"], "password":localStorage["OlympPass"]};
        var req = {
         method: 'POST',
         url: Ctrl.REST_URL+'profiles/api/auth/login',
         headers: {
             'Content-Type': 'application/json',
             'X-Token' : Ctrl.Token
           },
           data: loginfo
          };
        $http(req).then(
          function successCallback(response){
            Ctrl.SetupProfile(response.data.profile,loginfo.password);
          }, 
          function errorCallback(response){
            Olymp.fw7.app.alert(response.data.reason);
            console.log(response);
          });
       };

  },
  function(response) {
    
  }
);

/*-----------initialize some fields------------*/

this.allDealers = [];
this.products = [];

this.DropSelected = {
  'id': "",
  'name': "",
  'city': "",
  'address': ""
};

this.phone = "";

this.user = {};
this.sell =[];

/*--------------DROPDOWNS-----------------*/

this.DropDealer = Olymp.fw7.app.autocomplete({
    input: '#dropdown_dealer',
    openIn: 'dropdown',
    onChange: function(autocomplete, value){
      Ctrl.DropSelected.name = value;
      //erase next fields
      Ctrl.DropSelected.city = null;
      document.getElementById('dropdown_city').value = '';
      Ctrl.DropSelected.address = null;
      //check if city is unique
      var uniqueCheck = $.grep(Ctrl.allDealers, function(e){return (value==e.dealer_name)});
      if (!uniqueCheck[1]) {
        Ctrl.DropSelected.city = uniqueCheck[0].city;
        document.getElementById('dropdown_city').className += " not-emply-state";
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


this.DropProducts = Olymp.fw7.app.autocomplete({
      input: '#products-dropdown',
      openIn: 'dropdown',
      source: function (autocomplete, query, render) {
        var results = [];
        for (var i = 0; i < Ctrl.products.length; i++) {
          results.push(Ctrl.products[i].name);
        }
        render(results);
      }
  });

/*-----------Calendar instance------------*/

this.calendarDefault = Olymp.fw7.app.calendar({
    input: '#calendar-sell',
        value: [new Date()],
    convertToPopover: false,
    closeOnSelect: true,
    dateFormat: "dd.mm.yyyy",
    toolbarCloseText: "Готово",
    dayNamesShort: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        monthNames: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
'Июль', 'Август' , 'Сентябрь' , 'Октябрь', 'Ноябрь', 'Декабрь']

});  

/*----------Navigation functions-----------*/

this.GotoProfile = function () {
  Olymp.fw7.app.views[0].router.loadPage("#index");
  Olymp.fw7.app.closePanel();
};
this.GotoSale = function () {
  Olymp.fw7.app.views[0].router.loadPage("#sale");
  Olymp.fw7.app.closePanel()
  ;
};
this.GotoTransaction = function () {
  Olymp.fw7.app.views[0].router.loadPage("#transaction");
  Olymp.fw7.app.closePanel();
};
this.GotoCatalog = function () {
  Olymp.fw7.app.views[0].router.loadPage("#catalog");
  Olymp.fw7.app.closePanel();
};
this.GotoSertificate = function () {
  Olymp.fw7.app.views[0].router.loadPage("#sertificate");
  Olymp.fw7.app.closePanel();
};
this.GotoContact = function () {
  Olymp.fw7.app.views[0].router.loadPage("#contact");
  Olymp.fw7.app.closePanel();
};

this.Logout = function () {
  Olymp.fw7.app.closePanel();
  localStorage["OlympPhone"] = "";
  localStorage["OlympPass"] = "";
  Olymp.fw7.app.loginScreen();
}
/*-----------Regular functions------------*/

this.refresh = function() {
$timeout(function () {
    $scope.$apply();
    },50)
}

this.TakePhoto = function(){
  navigator.camera.getPicture(
  function success(imageData) {
     var image = document.getElementById('billImage');
     image.src =  imageData;
  }, 

  function error(error) {
    Olymp.fw7.app.alert("Не получилось открыть камеру.");
  },
  {});
}

this.ForgotPass = function(){
  Olymp.fw7.app.prompt('Введите свой номер телефона', function (value) {
    Ctrl.phone = value;
    Ctrl.TokenPass(value);
  });

}

this.SetupProfile = function(profile,pass){
  Olymp.fw7.app.closeModal();
      localStorage["OlympPhone"] = profile.phone_mobile;
      localStorage["OlympPass"] = pass;
  Ctrl.user = profile;
  console.log(profile);
  this.GetProducts(profile.dealer.name);

}

this.AddProduct = function(){
    var prod = Olymp.fw7.app.formToJSON('#product-form');
    Ctrl.sell.push(prod);
    document.getElementById('products-dropdown').value = "";
    document.getElementById('prod-num').value = "";
}




/*---------------REST API-----------------*/

this.GetDealers = function(){
  var req = {
   method: 'POST',
   url: this.REST_URL+'profiles/api/auth/register-info',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     }
    };
  $http(req).then(

    function successCallback(response){
      Ctrl.allDealers = response.data.dealers;
      console.log(response);
    }, 
    function errorCallback(response){
     Olymp.fw7.app.alert("Проверьте соединение с интернетом!");
    });
}

this.GetProducts = function(name){
  var info = {"dealer_name": name}
  var req = {
    method: 'POST',
    url: this.REST_URL+'sales/api/sales/products',
    headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
    },
    data: info
  };
  $http(req).then(

  function successCallback(response){
    Ctrl.products = response.data.products;
    console.log(response);
  }, 
  function errorCallback(response){
    Olymp.fw7.app.alert("Проверьте соединение с интернетом!");
  });

}

this.TokenPass = function(num){
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var info = {'phone': num};
  var req = {
   method: 'POST',
   url: this.REST_URL+'profiles/api/auth/token-remind',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     },
     data: info
    };

  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      Olymp.fw7.app.prompt("Введите присланный код", "",
        function(code){
          if (code==response.data.token){
            Olymp.fw7.app.modalLogin('Придумайте новый пароль:', function (pass1,pass2) {
            Ctrl.ResetPass(Ctrl.phone,pass1,pass2);
            });
          }
          else{
            Olymp.fw7.app.alert("Убедитесь в правильности введённого кода!");
          };
        }, 
        function(){
          
        });
      console.log(response);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
}

this.ResetPass = function(phone,pass1,pass2){
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var info = {
    "phone": phone,
    "password": pass1,
    "passwordCompare": pass2
  };
  var req = {
   method: 'POST',
   url: this.REST_URL+'profiles/api/auth/remind-password',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     },
     data: info
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      Ctrl.SetupProfile(response.data.profile, pass1);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
}

this.PullLoginForm = function () {
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var loginfo = Olymp.fw7.app.formToJSON('#login-form');
  var req = {
   method: 'POST',
   url: this.REST_URL+'profiles/api/auth/login',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     },
     data: loginfo
    };
  $http(req).then(
    function successCallback(response){
        Olymp.fw7.app.hidePreloader();
      Ctrl.SetupProfile(response.data.profile,loginfo.password);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
}


this.SendSMS = function () {
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var loginfo = Olymp.fw7.app.formToJSON('#pre-reg-form');
  console.log(loginfo);
  this.phone=loginfo.phone;
  var req = {
   method: 'POST',
   url: this.REST_URL+'profiles/api/auth/token',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
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
   url: this.REST_URL+'profiles/api/auth/register',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     },
     data: reginfo
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      Ctrl.SetupProfile(response.data.profile,reginfo.password);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
}

this.UpdateProfile = function(){
Olymp.fw7.app.showPreloader(["Подождите..."]);
  var info = Olymp.fw7.app.formToJSON('#update-profile-form');
  info.phone = localStorage["OlympPhone"];
  console.log(info);
  var req = {
   method: 'POST',
   url: this.REST_URL+'profiles/api/auth/profile-edit',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     },
     data: info
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      Ctrl.SetupProfile(response.data.profile,localStorage["OlympPass"]);
      myApp.alert('Данные успешно обновлены!', function () {
        Olymp.fw7.app.views[0].router.loadPage("#index");
    });
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
}


}]);