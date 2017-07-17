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

Olymp.angJS.filter('BonusCheer', function() {
  return function(x) {
    var message = ""
      if (x==0) {message = "Cамое время продать OLYMPUS!"}
      else if (x<=1000) {message = "Yеплохое начало!"}
      else if (x>1000) {message = "Отличный результат!"}
    return message;
    }
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

/*---initialize some fields, not important stuff---*/

this.allDealers = [];
this.products = [];

this.DropSelected = {
  'id': "",
  'name': "",
  'city': "",
  'address': ""
};

this.phone = "";
this.serial_number = "";

this.user = {};
this.sell =[];
this.sales_array = [];
this.transactions = [];
this.payments = [];
this.ndfl_countries = [];
this.ndfl_doctypes = [];
this.contest = {desc:'', users:[],plaintext:''};
this.cards_history = [];
this.sertificates = [];
this.selected_card = -1;
this.selected_nominal = 0;
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


this.DropCountries = Olymp.fw7.app.autocomplete({
      input: '#countries-dropdown',
      openIn: 'dropdown',
      source: function (autocomplete, query, render) {
        var results = [];
        for (var i = 0; i < Ctrl.ndfl_countries.length; i++) {
          if (Ctrl.ndfl_countries[i].name.toLowerCase().indexOf(query.toLowerCase()) >= 0) 
            {results.push(Ctrl.ndfl_countries[i].name)}
          
        }
        render(results);
      },
      onClose: function(autocomplete){
        Ctrl.refresh();
      }
  });
this.DropDocs = Olymp.fw7.app.autocomplete({
      input: '#docs-dropdown',
      openIn: 'dropdown',
      source: function (autocomplete, query, render) {
        var results = [];
        for (var i = 0; i < Ctrl.ndfl_doctypes.length; i++) {
          if (Ctrl.ndfl_doctypes[i].name.toLowerCase().indexOf(query.toLowerCase()) >= 0) 
            {results.push(Ctrl.ndfl_doctypes[i].name)}
          
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


/*------Sertificate amount picker------*/

  this.pickerAmount = Olymp.fw7.app.picker({
    input: '#picker-amount',
    toolbarCloseText: 'Готово',
    cols: [
        {
            textAlign: 'center',
            values: [1,2,3,4,5,6,7,8,9,10]
        }
    ]
});

/*------Date picker------*/
var today = new Date();
 
this.pickerInline = Olymp.fw7.app.picker({
    input: '#date-picker',
    toolbarCloseText: 'Готово',
    rotateEffect: true,
 
    value: [1, '01', today.getFullYear()],
 
    onChange: function (picker, values, displayValues) {
        var daysInMonth = new Date(picker.value[2], picker.value[1]*1, 0).getDate();
        if (values[0] > daysInMonth) {
            picker.cols[0].setValue(daysInMonth);
        }
    },
 
    formatValue: function (p, values, displayValues) {
        return displayValues[0] + '.' + values[1] + '.' + values[2];
    },
 
    cols: [
    // Days
        {
          values: (function () {
                var arr = [];
                for (var i = 1; i <= 31; i++) { arr.push(i); }
                return arr;
            })(),
            displayValues: ('01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31').split(',')
        },
        // Months
        {
            displayValues: ('Января Февраля Марта Апреля Мая Июня Июля Августа Сентября Октября Ноября Декабря').split(' '),
            values: ('01 02 03 04 05 06 07 08 09 10 11 12').split(' '),
            textAlign: 'center'
        },
        
        // Years
        {
            values: (function () {
                var arr = [];
                for (var i = 1940; i <= 2018; i++) { arr.push(i); }
                return arr;
            })(),
        }
    ]
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

this.Goto = function(id){
  Olymp.fw7.app.views[0].router.loadPage(id);
  Olymp.fw7.app.closePanel();
}

this.GotoContact = function () {
  Olymp.fw7.app.views[0].router.loadPage("#contact");
  document.getElementById('help-name').value = this.user.full_name;
  document.getElementById('help-email').value = this.user.email;
  document.getElementById('help-phone').value = this.user.phone_mobile;
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
this.OpenSertificate = function(num){
  this.selected_card = num;
  document.getElementById("picker-nominal").value = "";
  document.getElementById("picker-amount").value = "1";

  var str=this.sertificates[this.selected_card].standard_nominals_raw.replace(/ /g, "").replace(/;/g, ",");
  this.nominals = str.split(",");

  if (this.sertificates[this.selected_card].nominals_raw.search(/-/)!=-1){
    var min_index = this.sertificates[this.selected_card].nominals_raw.search(/-/);
    var max_index = this.sertificates[this.selected_card].nominals_raw.search(/:/);
    var min_sum = parseInt(this.sertificates[this.selected_card].nominals_raw.slice(0,min_index));
    var max_sum = parseInt(this.sertificates[this.selected_card].nominals_raw.slice(min_index+1,max_index));
    var step = parseInt(this.sertificates[this.selected_card].nominals_raw.slice(max_index+1));
    this.all_nominals = [];
    for (var i = 0; i <= (max_sum-min_sum)/step; i++) {
      var s = min_sum+i*step;
      this.all_nominals.push(s);
    }

  } else {
    this.all_nominals = [];
    var str=this.sertificates[this.selected_card].nominals_raw.replace(/ /g, "").replace(/;/g, ",");
    this.all_nominals = str.split(",");
  }

  //console.log(this.all_nominals);
  this.pickerSum = Olymp.fw7.app.picker({
    input: '#picker-nominal',
    toolbarCloseText: 'Готово',
    cols: [
        {
            textAlign: 'center',
            values: this.all_nominals
        }
    ]
});

  this.autocompleteDropdownAll = Olymp.fw7.app.autocomplete({
    input: '#autocomplete-nominal',
    openIn: 'dropdown',
    source: function (autocomplete, query, render) {
        var results = [];
        for (var i = 0; i < Ctrl.nominals.length; i++) {
            if (Ctrl.nominals[i].indexOf(query.toLowerCase()) >= 0) results.push(Ctrl.nominals[i]);
        }
        render(results);
    }
});
  this.refresh();
  Olymp.fw7.app.views[0].router.loadPage("#buy-sertificate");
}

this.Logout = function () {
  Olymp.fw7.app.closePanel();
  localStorage["OlympPhone"] = "";
  localStorage["OlympPass"] = "";
  Olymp.fw7.app.loginScreen();
}

/*-----------functions for ng-if------------*/

/*this.IsWide = function () {
  return $("#lpan").hasClass("panel-visible-by-breakpoint")
}*/

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
    type: 'standalone',
    toolbar: false,
      ofText: 'из'
});
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
  this.user = profile;
  console.log(profile);
  this.GetSales();
  this.GetProducts(profile.dealer.name);
  this.GetTransactions();
  this.GetNDFL();
  this.GetPayments();
  this.GetSertificates();
  this.GetContest();
}

this.IfShowAddProductButton = function(){
 if ((document.getElementById('products-dropdown').value == "")||(Ctrl.serial == "")){
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

this.WarnCard = function(){
  Olymp.fw7.app.alert('Обратите внимание, что обработка заказов на нестандартные номиналы может занять больше времени.')
}

this.ShowError = function(err) {
  var error = '';
  for (var key in err){
      error = error + err[key] + '\n'
  }
  Olymp.fw7.app.alert(error, 'Ошибка!');
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

this.GetNDFL = function(){
  var req = {
   method: 'POST',
   url: Ctrl.REST_URL+'sales/api/sales/ndfl-info',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     }
    };
  $http(req).then(
    function successCallback(response){
      console.log(response.data);
      Ctrl.ndfl_countries = response.data.countries;
      Ctrl.ndfl_doctypes = response.data.doc_types;
    }, 
    function errorCallback(response){
      Olymp.fw7.app.alert(response.data.reason);
      console.log(response);
  });
}

this.GetTransactions = function(){
  var req = {
   method: 'POST',
   url: Ctrl.REST_URL+'sales/api/sales/transaction-history',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     },
     data: {'phone': localStorage["OlympPhone"]}
    };
  $http(req).then(
    function successCallback(response){
      console.log("transaction history:");
      console.log(response.data);
      Ctrl.transactions = response.data.transactions;
      Ctrl.cards_history = response.data.sertificates;
    }, 
    function errorCallback(response){
      Olymp.fw7.app.alert(response.data.reason);
      console.log(response);
  });
}

this.GetSertificates = function(){
  var req = {
   method: 'POST',
   url: Ctrl.REST_URL+'sales/api/sales/cards',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     }
    };
  $http(req).then(
    function successCallback(response){
      console.log("cards:");
      console.log(response.data);
      Ctrl.sertificates = response.data.cards;
    }, 
    function errorCallback(response){
      Olymp.fw7.app.alert(response.data.reason);
      console.log(response);
  });
}

this.GetContest = function(){
  var req = {
   method: 'POST',
   url: Ctrl.REST_URL+'sales/api/sales/top',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     }
    };
  $http(req).then(
    function successCallback(response){
      console.log("contest");
      console.log(response.data);
      Ctrl.contest.desc = response.data.desc;
      Ctrl.contest.users = response.data.top;
      Ctrl.contest.plaintext = response.data.desc.replace(/(<([^>]+)>)/ig,"");
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

this.GetPayments = function(){
  var req = {
   method: 'POST',
   url: this.REST_URL+'/payments/api-v3/payments/by-profile',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     },
     data: {"profile_id": this.user.profile_id}
    };
  $http(req).then(
    function successCallback(response){
      Ctrl.payments = response.data.payments;
      console.log(response);
    }, 
    function errorCallback(response){
      console.log(response);
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
    console.log(response);
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
if ((Ctrl.DropSelected.id)&&(reginfo.first_name)&&(reginfo.last_name)&&(reginfo.email)){

  if (reginfo.agreeWithTerms[0]) {reginfo.agreeWithTerms=1} 
    else {reginfo.agreeWithTerms=0};
  if (reginfo.allowPersonalDataProcessing[0]) {reginfo.allowPersonalDataProcessing=1} 
    else {reginfo.allowPersonalDataProcessing=0};
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

  } else {
    Olymp.fw7.app.hidePreloader();
    Olymp.fw7.app.alert('Заполните все обязательные поля!')};
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

this.Feedback = function(){
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var info = Olymp.fw7.app.formToJSON('#help-form');
  info.phone_mobile = localStorage["OlympPhone"];
  var req = {
   method: 'POST',
   url: this.REST_URL+'sales/api/sales/feedback',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     },
     data: info
    };
  $http(req).then(
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
    });
}

this.BuySertificate = function(){
    Olymp.fw7.app.showPreloader(["Подождите..."]);
 var info = Olymp.fw7.app.formToJSON('#sertificate-form');
 if (info.nominal!=-1){
  info.nominal = this.nominals[info.nominal];
 } else {
  info.nominal = info.special_nominal;
 };
  info.type = this.sertificates[this.selected_card].type;
  var json = {
    cards: [info],
    phone: localStorage["OlympPhone"],
    is_allow_cancel: 1,
    action: 'create'
  };
  console.log(json);

  var req = {
   method: 'POST',
   url: this.REST_URL+'sales/api/sales/buy-sertificate',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     },
     data: json
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      console.log(response.data);
      Olymp.fw7.app.alert("Покупка сертификата прошла успешно!");
      Ctrl.GetProfile();
    }, 
    function errorCallback(response){
      Olymp.fw7.app.hidePreloader();
      console.log(response);
      Ctrl.ShowError(response.data.errors);
    });

}

this.Payment = function(){
  Olymp.fw7.app.showPreloader(["Подождите..."]);
 var info = Olymp.fw7.app.formToJSON('#payment-form');
   var json = {"profile_id":this.user.profile_id,
   "type":"card",
   "amount":info.money,
   "parameters":{"phone_mobile": info.card}}

  var req = {
   method: 'POST',
   url: this.REST_URL+'/payments/api-v3/payments/create',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
     },
     data: json
    };
  $http(req).then(
    function successCallback(response){
      Olymp.fw7.app.hidePreloader();
      console.log(response.data);
      Olymp.fw7.app.alert("Перевод денег прошёл успешно!", function(){Ctrl.GetProfile()});
    }, 
    function errorCallback(response){
      Olymp.fw7.app.hidePreloader();
      console.log(response);
      Ctrl.ShowError(response.data.errors);
    });
}

this.SendNdflForm = function(){
  Olymp.fw7.app.showPreloader(["Подождите..."]);
  var info = Olymp.fw7.app.formToJSON('#ndfl-form');
  info.phone_mobile = localStorage["OlympPhone"];

  var countryCheck = $.grep(Ctrl.ndfl_countries, function(e){return (info.country==e.name)});
  if (countryCheck[0]) {
    info.citizenship_id = countryCheck[0].id
  } else {
    Olymp.fw7.app.hidePreloader();
    Olymp.fw7.app.alert("Выберите страну из списка!");
    return;
  }
  var docCheck = $.grep(Ctrl.ndfl_doctypes, function(e){return (info.document_type==e.name)});
  if (docCheck[0]) {
    info.document_type_id = docCheck[0].id
  } else {
    Olymp.fw7.app.hidePreloader();
    Olymp.fw7.app.alert("Выберите из списка документ, удостоверяющий личность!");
    return;
  }

  var req = {
   method: 'POST',
   url: this.REST_URL+'sales/api/sales/ndfl-form',
   headers: {
       'Content-Type': 'application/json',
       'X-Token' : Ctrl.Token
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
      Ctrl.ShowError(response.data.errors);
    });
}

}]);