Olymp.angJS.service('HttpService', ['$http', '$rootScope', function ($http, $rootScope) {

/*---------------REST API-----------------*/

$rootScope.GetInfo = function(url,info,data_and_keys,success_func){
  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+url,
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: info
    };
  $http(req).then(
    function successCallback(response){
      console.log(response.data);
      for (var property in data_and_keys) {
        if (data_and_keys.hasOwnProperty(property)) {
          $rootScope[property]  = response.data[data_and_keys[property]];
        }
      };
    if (success_func){success_func(response)};     
    }, 
    function errorCallback(response){
      console.log(response);
  });

}


$rootScope.GetProfile = function () {
  var loginfo = {'profile_id' : localStorage["OlympID"]};
  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'profiles/api/auth/profile-info',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: loginfo
    };
  $http(req).then(
    function successCallback(response){
      $rootScope.SetupProfile(response.data.profile);
    }, 
    function errorCallback(response){
      Olymp.fw7.app.alert(response.data.reason);
      console.log(response);
  });
}

$rootScope.GetDealers = function(){
  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'profiles/api/auth/register-info',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     }
    };
  $http(req).then(

    function successCallback(response){
      $rootScope.allDealers = response.data.dealers;
      console.log(response);
    }, 
    function errorCallback(response){
     Olymp.fw7.app.alert("Проверьте соединение с интернетом!");
    });
}


$rootScope.TokenPass = function(num){
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var info = {'phone': num};
  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'profiles/api/auth/token-remind',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
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
            $rootScope.ResetPass($rootScope.phone,pass1,pass2);
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
  Olymp.fw7.app.alert(response.data);
  console.log(response);
    });
}

$rootScope.ResetPass = function(phone,pass1,pass2){
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var info = {
    "phone": phone,
    "password": pass1,
    "passwordCompare": pass2
  };
  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'profiles/api/auth/remind-password',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: info
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      $rootScope.SetupProfile(response.data.profile);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
}

$rootScope.CheatLogin = function () {
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var loginfo = Olymp.fw7.app.formToJSON('#login-form');
  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'profiles/api/auth/profile-info',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: {"phone":loginfo.phone}
    };
  $http(req).then(
    function successCallback(response){
        Olymp.fw7.app.hidePreloader();
      $rootScope.SetupProfile(response.data.profile);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
}

$rootScope.PullLoginForm = function () {
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var loginfo = Olymp.fw7.app.formToJSON('#login-form');
  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'profiles/api/auth/login',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: loginfo
    };
  $http(req).then(
    function successCallback(response){
        Olymp.fw7.app.hidePreloader();
      $rootScope.SetupProfile(response.data.profile);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
}


$rootScope.SendSMS = function () {
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var loginfo = Olymp.fw7.app.formToJSON('#pre-reg-form');
  console.log(loginfo);
  $rootScope.phone=loginfo.phone;
  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'profiles/api/auth/token',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: loginfo
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
/*      $rootScope.testToken = response.data.token;*/
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


$rootScope.Register = function(){
Olymp.fw7.app.showPreloader(["Подождите..."]);
var reginfo = Olymp.fw7.app.formToJSON('#reg-form');
if (($rootScope.DropSelected.id)&&(reginfo.first_name)&&(reginfo.last_name)&&(reginfo.email)){

  if (reginfo.agreeWithTerms[0]) {reginfo.agreeWithTerms=1} 
    else {reginfo.agreeWithTerms=0};
  if (reginfo.allowPersonalDataProcessing[0]) {reginfo.allowPersonalDataProcessing=1} 
    else {reginfo.allowPersonalDataProcessing=0};
  reginfo.phone_mobile_local = $rootScope.phone;
  reginfo.dealer_id = $rootScope.DropSelected.id;
  console.log(reginfo);
  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'profiles/api/auth/register',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: reginfo
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      $rootScope.SetupProfile(response.data.profile);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });

  } else {
    Olymp.fw7.app.hidePreloader();
    Olymp.fw7.app.alert('Заполните все обязательные поля!')};
}

$rootScope.UpdateProfile = function(){
Olymp.fw7.app.showPreloader(["Подождите..."]);
  var info = Olymp.fw7.app.formToJSON('#update-profile-form');
  info.profile_id = localStorage["OlympID"];
  console.log("new profile info");
  console.log(info);
  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'profiles/api/auth/profile-edit',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: info
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      Olymp.fw7.app.alert('Данные успешно обновлены!', function () {
        $rootScope.SetupProfile(response.data.profile);
        Olymp.fw7.app.views[0].router.back();
    });
     
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
}

$rootScope.GetSales = function(){
  var info = {'profile_id' : localStorage["OlympID"]}
  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'sales/api/sales/sales',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: info
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      $rootScope.sales_array = response.data.sales;
      console.log(response.data.sales);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
}

$rootScope.CheckSale = function(status){
  if ($rootScope.selected_sale==-1) {
    $rootScope.SendSale(status)
  } else {
    $rootScope.UpdateSale(status)
  }
}

$rootScope.SendSale = function (status) {
if (!$rootScope.image) {
  Olymp.fw7.app.alert('Сделайте фотографию чека!')
}else {

  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var form_info = Olymp.fw7.app.formToJSON('#new-sale');
  var products = [];
  for (var i = 0; i < $rootScope.sell.length; i++) {

    products.push({"category_id": $rootScope.sell[i].category_id,
            "product_id": $rootScope.sell[i].id,
            "quantityLocal": 1,
            "serialNumberValue": $rootScope.sell[i].serial_number,
            "validation_method": "serial"});
  };
  var info = {'profile_id' : localStorage["OlympID"],
    "sale": {
      "status": status,
        "sold_on_local": form_info.date,
        "positions": products
    },
    "documents": [{
        "type": "jpg",
        "image": $rootScope.image
    }]}
    console.log(info);
  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'sales/api/sales/create',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: info
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      $rootScope.GetSales();
      Olymp.fw7.app.views[0].router.loadPage("#old_sales");
      console.log(response.data.sales);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
  }
}

$rootScope.UpdateSale = function(status){

  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var form_info = Olymp.fw7.app.formToJSON('#new-sale');
  var products = [];
  for (var i = 0; i < $rootScope.sell.length; i++) {

    products.push({"category_id": $rootScope.sell[i].category_id,
            "product_id": $rootScope.sell[i].id,
            "quantityLocal": 1,
            "serialNumberValue": $rootScope.sell[i].serial_number,
            "validation_method": "serial"});
  };
  var info = {
    "sale_id": $rootScope.sales_array[$rootScope.selected_sale].sale_id,
    "sale": {
      "status": status,
        "sold_on_local": form_info.date,
        "positions": products
    }};
    if ($rootScope.image) {
      info.documents = [{
        "type": "jpg",
        "image": $rootScope.image}]
    }
    console.log(info);
  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'sales/api/sales/update',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: info
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      $rootScope.GetSales();
      Olymp.fw7.app.views[0].router.loadPage("#old_sales");
      console.log(response.data.sales);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
}

$rootScope.Feedback = function(){
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var info = Olymp.fw7.app.formToJSON('#help-form');
  info.profile_id = localStorage["OlympID"];
  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'feedback/api/feedback/feedback',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: info
    };
    console.log(info);
/*  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      console.log(response.data);
      Olymp.fw7.app.alert(response.data.message, function(){
        document.getElementById("help-form").reset()
      });
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });*/
}

$rootScope.BuySertificate = function(){
    Olymp.fw7.app.showPreloader(["Подождите..."]);
 var info = Olymp.fw7.app.formToJSON('#sertificate-form');
  info.nominal = $rootScope.sertificates[$rootScope.selected_card].nominals[info.nominal];

  info.card = $rootScope.sertificates[$rootScope.selected_card].type;
  var json = {
    items: [info],
    profile_id : localStorage["OlympID"],
    delivery_email: $rootScope.user.email
  };
  console.log(json);

  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'/catalog/api-v3/orders/create',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: json
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      console.log(response.data);
      Olymp.fw7.app.alert("В течение 8 дней сертификат придёт на почту, указанную в вашем профиле!");
      $rootScope.GetProfile();
    }, 
    function errorCallback(response){
      Olymp.fw7.app.hidePreloader();
      console.log(response);
      $rootScope.ShowError(response.data.errors);
    });

}

$rootScope.Payment = function(){
  Olymp.fw7.app.showPreloader(["Подождите..."]);
 var info = Olymp.fw7.app.formToJSON('#payment-form');
   var json = {"profile_id":$rootScope.user.profile_id,
   "type":"card",
   "amount":info.money,
   "parameters":{"phone_mobile": info.card}}

  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'/payments/api-v3/payments/create',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: json
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      console.log(response.data);
      Olymp.fw7.app.alert("Перевод денег прошёл успешно!", function(){$rootScope.GetProfile()});
    }, 
    function errorCallback(response){
      Olymp.fw7.app.hidePreloader();
      console.log(response);
      $rootScope.ShowError(response.data.errors);
    });
}

$rootScope.SendNdflForm = function(){
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var info = Olymp.fw7.app.formToJSON('#ndfl-form');
  info.profile_id = localStorage["OlympID"];

  var countryCheck = $.grep($rootScope.ndfl_countries, function(e){return (info.country==e.name)});
  if (countryCheck[0]) {
    info.citizenship_id = countryCheck[0].id
  } else {
    Olymp.fw7.app.hidePreloader();
    Olymp.fw7.app.alert("Выберите страну из списка!");
    return;
  }
  var docCheck = $.grep($rootScope.ndfl_doctypes, function(e){return (info.document_type==e.name)});
  if (docCheck[0]) {
    info.document_type_id = docCheck[0].id
  } else {
    Olymp.fw7.app.hidePreloader();
    Olymp.fw7.app.alert("Выберите из списка документ, удостоверяющий личность!");
    return;
  }

  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'profiles/api/ndfl/ndfl-form',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: info
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      console.log(response.data);
      Olymp.fw7.app.alert("Анкета успешно отправлена!");
    }, 
    function errorCallback(response){
      Olymp.fw7.app.hidePreloader();
      console.log(response);
      $rootScope.ShowError(response.data.errors);
    });
}

$rootScope.DownloadSertificate = function(order, card, status){
if (status=="ready") {
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'/catalog/api-v3/cards/download',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : $rootScope.Token
     },
     data: {"ms_order_id": order, "ms_card_id": card}
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      console.log(response.data);
      window.open(response.data.url, '_system');
    }, 
    function errorCallback(response){
      Olymp.fw7.app.hidePreloader();
      console.log(response);
      $rootScope.ShowError(response.data.errors);
    });
  }
}

  
}]);