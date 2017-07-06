Olymp.angJS.filter('Status', function() {
  return function(x) {
    var message = "";
    switch (x){
      case 'draft': message = "Черновик"; break;
      case 'adminReview': message = "Требует подтверждения"; break;
      case 'approved': message = "Подтверждено автоматически"; break;
      case 'approved2': message = "Подтверждено"; break;
      case 'declined': message = "Отклонено"; break;
      case 'paid': message = "Баллы начислены"; break;
      default: message = "";
    }
    return message;
  };
});

Olymp.angJS.filter('Bonus', function() {
  return function(x) {
    return x.slice(0, -2);
  };
});

Olymp.angJS.controller('mainController',[ '$http','$scope','$rootScope','$timeout','InitService',
function($http,$scope,$rootScope,$timeout,InitService){
  'use strict';
  var Ctrl = this;

/*-----------Wait for DOM------------*/
  InitService.addEventListener('ready', function () {
    console.log('mainController: ok, DOM ready');
      });

/*-----------Some var-s for REST------------*/

this.REST_URL = "http://test.olympus.msforyou.ru/";

$http({method: 'GET', url: 'q.env'}).then(
  function(response) {
    Ctrl.Token = response.data;
    Ctrl.GetDealers();

        /*---Check if logged in---*/
       if ((!localStorage["OlympPhone"]) ||(localStorage["OlympPhone"]=="")) {
        Olymp.fw7.app.loginScreen();
       }
       else {
          Ctrl.GetProfile();
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
this.sales_array = [];
this.selected_sale = -1;
this.image = "";

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
      },
      onClose: function(autocomplete){
        Ctrl.refresh();
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

/*-----------Photo preview------------*/

var ph = [];
for (var i = 0; i < 13; i++) {
 ph.push('docs/rules/'+i+'.jpg');
};

this.rulesPhoto = Olymp.fw7.app.photoBrowser({
  photos : ph,
  theme: 'dark',
  type: 'standalone',
  ofText: 'из',
  navbarTemplate: '<div class="navbar">'+
    '<div class="navbar-inner">'+
        '<div class="left sliding">'+
            '<a href="#" class="link photo-browser-close-link {{#unless backLinkText}}icon-only{{/unless}} {{js "this.type === \'page\' ? \'back\' : \'\'"}}">' +
                '<i class="icon icon-back {{iconsColorClass}}"></i>'+
                '{{#if backLinkText}}<span>{{backLinkText}}</span>{{/if}}'+
            '</a>'+
        '</div>'+
        '<div class="center sliding">'+
            '<span class="photo-browser-current"></span>' +
            '<span class="photo-browser-of">{{ofText}}</span>' +
            '<span class="photo-browser-total"></span>'+
        '</div>'+
        '<div class="right"></div>'+
    '</div>'+
'</div>'
});

this.persPhoto = Olymp.fw7.app.photoBrowser({
  photos : ['docs/rules/0.jpg','docs/rules/1.jpg'],
  theme: 'dark',
  type: 'standalone',
  ofText: 'из',
  navbarTemplate: '<div class="navbar">'+
    '<div class="navbar-inner">'+
        '<div class="left sliding">'+
            '<a href="#" class="link photo-browser-close-link {{#unless backLinkText}}icon-only{{/unless}} {{js "this.type === \'page\' ? \'back\' : \'\'"}}">' +
                '<i class="icon icon-back {{iconsColorClass}}"></i>'+
                '{{#if backLinkText}}<span>{{backLinkText}}</span>{{/if}}'+
            '</a>'+
        '</div>'+
        '<div class="center sliding">'+
            '<span class="photo-browser-current"></span>' +
            '<span class="photo-browser-of">{{ofText}}</span>' +
            '<span class="photo-browser-total"></span>'+
        '</div>'+
        '<div class="right"></div>'+
    '</div>'+
'</div>'
});




/*-----------Fancy Keypads------------*/

this.CardKeypad = Olymp.fw7.app.keypad({
    input: '.mask_card',
    valueMaxLength: 16,
    dotButton: false,
    toolbarCloseText: 'Готово'
});

this.MoneyKeypad = Olymp.fw7.app.keypad({
    input: '.mask_money',
    dotButton: true,
    toolbarCloseText: 'Готово'
});

this.PhoneKeypad = Olymp.fw7.app.keypad({
    input: '.mask_phone',
    valueMaxLength: 13,
    dotButton: false,
    toolbarCloseText: 'Готово'
});
this.PhoneKeypad2 = Olymp.fw7.app.keypad({
    input: '.mask_phone2',
    valueMaxLength: 13,
    dotButton: false,
    toolbarCloseText: 'Готово'
});

$scope.$watch('PhoneInput', function() {
  if ((!$scope.PhoneInput)||(!$scope.PhoneInput[3])){
    $scope.PhoneInput = "+7 ";
    Ctrl.PhoneKeypad.value = "+7 ";
    Ctrl.PhoneKeypad2.value = "+7 ";
  }
  });

/*----------Navigation functions-----------*/

this.GotoProfile = function () {
  Olymp.fw7.app.views[0].router.loadPage("#index");
  Olymp.fw7.app.closePanel();
};
this.GotoSale = function () {
  Olymp.fw7.app.views[0].router.loadPage("#old_sales");
  Olymp.fw7.app.closePanel();
  this.GetSales();
};
this.GotoTransaction = function () {
  Olymp.fw7.app.views[0].router.loadPage("#transaction");
  Olymp.fw7.app.closePanel();
};
this.GotoBonus = function () {
  Olymp.fw7.app.views[0].router.loadPage("#bonus");
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

this.OpenNewSale = function() {
  this.selected_sale = -1;
  this.sell = [];
  document.getElementById('products-dropdown').value = "";
  document.getElementById('prod-num').value = "";
  document.getElementById('billImage').src = "";
  this.calendarDefault.value = [new Date()];
  document.getElementById('calendar-sell').value = moment().format("DD.MM.YYYY");
  Ctrl.billView = {};

  Olymp.fw7.app.views[0].router.loadPage("#sale");
}

this.Logout = function () {
  Olymp.fw7.app.closePanel();
  localStorage["OlympPhone"] = "";
  localStorage["OlympPass"] = "";
  Olymp.fw7.app.loginScreen();
}
/*-----------Regular functions------------*/

this.refresh = function() {
//helps to update changing inputs
$timeout(function () {
    $scope.$apply();
    },50)
}

this.TakePhoto = function(){
  navigator.camera.getPicture(
  function success(imageData) {
     var image = document.getElementById('billImage');
     image.src =  'data:image/jpg;base64,'+imageData;
     Ctrl.image = imageData;
     Ctrl.SetPhoto('data:image/jpg;base64,'+imageData);
  }, 

  function error(error) {
    Olymp.fw7.app.alert("Не получилось сделать фотографию.");
  },
  {destinationType: Camera.DestinationType.DATA_URL});
}

this.SetPhoto = function (photo) {
  Ctrl.billView = Olymp.fw7.app.photoBrowser({
    photos : [photo],
    theme: 'dark',
    type: 'popup',
    toolbar: false,
      ofText: 'из'
});
}


this.ForgotPass = function(){
  Olymp.fw7.app.prompt('Введите свой номер телефона', function (value) {
    this.phone = value;
    this.TokenPass(value);
  });

}

this.SetupProfile = function(profile,pass){
  Olymp.fw7.app.closeModal();
      localStorage["OlympPhone"] = profile.phone_mobile;
      localStorage["OlympPass"] = pass;
  this.user = profile;
  console.log(profile);
  this.GetSales();
  this.GetProducts(profile.dealer.name);
}

this.IfShowAddProductButton = function(){
 if (document.getElementById('products-dropdown').value == ""){
  return false} else {return true}
}

this.AddProduct = function(){
    var prod = Olymp.fw7.app.formToJSON('#product-form');
    for (var i = 0; i < this.products.length; i++) {
      if (this.products[i].name == prod.name) {
        prod.id = this.products[i].id;
        prod.category_id = this.products[i].category_id;
      }
    }
    this.sell.push(prod);
    document.getElementById('products-dropdown').value = "";
    document.getElementById('prod-num').value = "";
}

this.DeleteProduct = function(i){
  this.sell.splice(i,1);
}


this.EditSale = function(){
  this.sell = [];
  var products_array = this.sales_array[this.selected_sale].positions;
  for (var i = 0; i < products_array.length; i++) {
    this.sell.push({'name': products_array[i].product.name,
      'serial_number': products_array[i].custom_serial,
      'id': products_array[i].product.id,
      'category_id': products_array[i].product.category.id
    });
  }
  var re = /([0-9]+).([0-9]+).([0-9]+)/;
  var swapMonthDay = this.sales_array[this.selected_sale].sold_on.replace(re, '$2.$1.$3');
  this.calendarDefault.value[0] = swapMonthDay;
  document.getElementById('calendar-sell').value = this.sales_array[this.selected_sale].sold_on;
  document.getElementById('products-dropdown').value = "";
  document.getElementById('prod-num').value = "";
  var image = document.getElementById('billImage');
  image.src = this.sales_array[this.selected_sale].documents[0].image_url;
  this.SetPhoto(this.sales_array[this.selected_sale].documents[0].image_url);
  Olymp.fw7.app.views[0].router.loadPage("#sale");
}


/*---------------REST API-----------------*/

this.GetProfile = function () {
  // var loginfo = {"phone":localStorage["OlympPhone"], "password":localStorage["OlympPass"]};
  var loginfo = {"phone":localStorage["OlympPhone"]};
  var req = {
   method: 'POST',
   url: Ctrl.REST_URL+'profiles/api/auth/profile-info',
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
}

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
  Olymp.fw7.app.alert(response.data);
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

this.CheatLogin = function () {
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var loginfo = Olymp.fw7.app.formToJSON('#login-form');
  var req = {
   method: 'POST',
   url: this.REST_URL+'profiles/api/auth/profile-info',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     },
     data: {"phone":loginfo.phone}
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
  console.log("new profile info");
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
      Olymp.fw7.app.alert('Данные успешно обновлены!', function () {
        Ctrl.SetupProfile(response.data.profile,localStorage["OlympPass"]);
        Olymp.fw7.app.views[0].router.back();
    });
     
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
}

this.GetSales = function(){
  var info = {"phone": localStorage["OlympPhone"]}
  var req = {
   method: 'POST',
   url: this.REST_URL+'sales/api/sales/sales',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     },
     data: info
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      Ctrl.sales_array = response.data.sales;
      console.log(response.data.sales);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
}

this.CheckSale = function(status){
  if (Ctrl.selected_sale==-1) {
    this.SendSale(status)
  } else {
    this.UpdateSale(status)
  }
}

this.SendSale = function (status) {
if (!Ctrl.image) {
  Olymp.fw7.app.alert('Сделайте фотографию чека!')
}else {

  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var form_info = Olymp.fw7.app.formToJSON('#new-sale');
  var products = [];
  for (var i = 0; i < this.sell.length; i++) {

    products.push({"category_id": this.sell[i].category_id,
            "product_id": this.sell[i].id,
            "quantityLocal": 1,
            "serialNumberValue": this.sell[i].serial_number,
            "validation_method": "serial"});
  };
  var info = {"phone": localStorage["OlympPhone"],
    "sale": {
      "status": status,
        "sold_on_local": form_info.date,
        "positions": products
    },
    "documents": [{
        "type": "jpg",
        "image": Ctrl.image
    }]}
    console.log(info);
  var req = {
   method: 'POST',
   url: this.REST_URL+'sales/api/sales/create',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     },
     data: info
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      Ctrl.GetSales();
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

this.UpdateSale = function(status){

  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var form_info = Olymp.fw7.app.formToJSON('#new-sale');
  var products = [];
  for (var i = 0; i < this.sell.length; i++) {

    products.push({"category_id": this.sell[i].category_id,
            "product_id": this.sell[i].id,
            "quantityLocal": 1,
            "serialNumberValue": this.sell[i].serial_number,
            "validation_method": "serial"});
  };
  var info = {
    "sale_id": Ctrl.sales_array[Ctrl.selected_sale].sale_id,
    "sale": {
      "status": status,
        "sold_on_local": form_info.date,
        "positions": products
    }};
    if (Ctrl.image) {
      info.documents = [{
        "type": "jpg",
        "image": Ctrl.image}]
    }
    console.log(info);
  var req = {
   method: 'POST',
   url: this.REST_URL+'sales/api/sales/update',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     },
     data: info
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      Ctrl.GetSales();
      Olymp.fw7.app.views[0].router.loadPage("#old_sales");
      console.log(response.data.sales);
    }, 
    function errorCallback(response){
  Olymp.fw7.app.hidePreloader();
  Olymp.fw7.app.alert(response.data.reason);
  console.log(response);
    });
}

}]);