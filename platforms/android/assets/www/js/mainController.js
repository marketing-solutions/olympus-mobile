Olymp.angJS.controller('mainController',[ '$http','$scope','$rootScope','$timeout','InitService','DeclareService',
function($http,$scope,$rootScope,$timeout,InitService,DeclareService){
  'use strict';

/*-----------Wait for DOM------------*/
  InitService.addEventListener('ready', function () {
    console.log('mainController: ok, DOM ready');
      });

/*-----------Some var-s for REST------------*/

$rootScope.REST_URL = "http://test.olympus.msforyou.ru/";

$http({method: 'GET', url: 'q.env'}).then(
  function(response) {
    $rootScope.Token = response.data;
    $rootScope.GetDealers();

    /*---Check if logged in---*/
     if ((!localStorage["OlympID"]) ||(localStorage["OlympID"]=="")) {
      Olymp.fw7.app.loginScreen();
     }
     else {
        $rootScope.GetProfile();
     };

  },
  function(response) {
    
  }
);

/*---initialize some fields, not important stuff---*/

$rootScope.allDealers = [];
$rootScope.products = [];

$rootScope.DropSelected = {
  'id': "",
  'name': "",
  'city': "",
  'address': ""
};

$rootScope.phone = "";
$rootScope.serial = "";

$rootScope.user = {};
$rootScope.sell =[];
$rootScope.sales_array = [];
$rootScope.transactions = [];
$rootScope.payments = [];
$rootScope.ndfl_countries = [];
$rootScope.ndfl_doctypes = [];
$rootScope.ndfl_form = {};
$rootScope.contest_users = {};
$rootScope.contest_plaintext = '';
$rootScope.feedback_categories = [];
$rootScope.cards_history = [];
$rootScope.sertificates = [];
$rootScope.selected_card = -1;
$rootScope.selected_nominal = 0;
$rootScope.selected_sale = -1;
$rootScope.image = "";

/*--------------DROPDOWNS-----------------*/

$rootScope.DropDealer = Olymp.fw7.app.autocomplete({
    input: '#dropdown_dealer',
    openIn: 'dropdown',
    onChange: function(autocomplete, value){
      $rootScope.DropSelected.name = value;
      //erase next fields
      $rootScope.DropSelected.city = null;
      document.getElementById('dropdown_city').value = '';
      $rootScope.DropSelected.address = null;
      //check if city is unique
      var uniqueCheck = $.grep($rootScope.allDealers, function(e){return (value==e.dealer_name)});
      if (!uniqueCheck[1]) {
        $rootScope.DropSelected.city = uniqueCheck[0].city;
        document.getElementById('dropdown_city').className += " not-emply-state";
        //check if address is unique
        var uniqueCheck2 = $.grep($rootScope.allDealers, function(e){return (($rootScope.DropSelected.name==e.dealer_name)&&($rootScope.DropSelected.city==e.city))});
        if (!uniqueCheck2[1]) {$rootScope.DropSelected.address = uniqueCheck2[0].address;};
      };
      $rootScope.refresh();
    },
    source: function (autocomplete, query, render) {
        var results = [];

        for (var i = 0; i < $rootScope.allDealers.length; i++) {
          var match = $.grep(results, function(e){return (e==$rootScope.allDealers[i].dealer_name)});
            if (!match[0]) {results.push($rootScope.allDealers[i].dealer_name)};
        };
        render(results);
    }
});

$rootScope.DropCity = Olymp.fw7.app.autocomplete({
    input: '#dropdown_city',
    openIn: 'dropdown',
    onChange: function(autocomplete, value){
      $rootScope.DropSelected.city = value;
      $rootScope.DropSelected.address = null;
      //check if address is unique
      var uniqueCheck = $.grep($rootScope.allDealers, function(e){return (($rootScope.DropSelected.name==e.dealer_name)&&(value==e.city))});
      if (!uniqueCheck[1]) {$rootScope.DropSelected.address = uniqueCheck[0].address};
      $rootScope.refresh();
    },

    source: function (autocomplete, query, render) {
        var results = [];
        for (var i = 0; i < $rootScope.allDealers.length; i++) {
            if ($rootScope.allDealers[i].dealer_name==$rootScope.DropSelected.name){
              var match = $.grep(results, function(e){return (e==$rootScope.allDealers[i].city)});
            if (!match[0]) {results.push($rootScope.allDealers[i].city)};
            }
        };

        render(results);
    }
});

$rootScope.DropAddress = Olymp.fw7.app.autocomplete({
    input: '#dropdown_address',
    openIn: 'dropdown',
    onChange: function(autocomplete, value){
      $rootScope.DropSelected.address = value;
      for (var i = 0; i < $rootScope.allDealers.length; i++) {
            if (($rootScope.allDealers[i].dealer_name==$rootScope.DropSelected.name)&&($rootScope.allDealers[i].address==value)){
                $rootScope.DropSelected.id = $rootScope.allDealers[i].id;
                return;
            }
        };

    },
    source: function (autocomplete, query, render) {
        var results = [];
        for (var i = 0; i < $rootScope.allDealers.length; i++) {
            if (($rootScope.allDealers[i].dealer_name==$rootScope.DropSelected.name)&&($rootScope.allDealers[i].city==$rootScope.DropSelected.city)){
                results.push($rootScope.allDealers[i].address);
            }
        };

        render(results);
    }
});


$rootScope.DropProducts = Olymp.fw7.app.autocomplete({
      input: '#products-dropdown',
      openIn: 'dropdown',
      source: function (autocomplete, query, render) {
        var results = [];
        for (var i = 0; i < $rootScope.products.length; i++) {
          results.push($rootScope.products[i].name);
        }
        render(results);
      },
      onClose: function(autocomplete){
        $rootScope.refresh();
      }
  });


$rootScope.DropCountries = Olymp.fw7.app.autocomplete({
      input: '#countries-dropdown',
      openIn: 'dropdown',
      source: function (autocomplete, query, render) {
        var results = [];
        for (var i = 0; i < $rootScope.ndfl_countries.length; i++) {
          results.push($rootScope.ndfl_countries[i].name)
        }
        render(results);
      },
      onClose: function(autocomplete){
        $rootScope.refresh();
      }
  });

$rootScope.DropDocs = Olymp.fw7.app.autocomplete({
      input: '#docs-dropdown',
      openIn: 'dropdown',
      source: function (autocomplete, query, render) {
        var results = [];
        for (var i = 0; i < $rootScope.ndfl_doctypes.length; i++) {
          results.push($rootScope.ndfl_doctypes[i].name)  
        }
        render(results);
      },
      onClose: function(autocomplete){
        $rootScope.refresh();
      }
  });

/*-----------Calendar instance------------*/
$rootScope.calendarDefault = Olymp.fw7.app.calendar({
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

$rootScope.rulesPhoto = Olymp.fw7.app.photoBrowser({
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

$rootScope.persPhoto = Olymp.fw7.app.photoBrowser({
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

  $rootScope.pickerAmount = Olymp.fw7.app.picker({
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
 
$rootScope.pickerInline = Olymp.fw7.app.picker({
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

$rootScope.CardKeypad = Olymp.fw7.app.keypad({
    input: '.mask_card',
    valueMaxLength: 16,
    dotButton: false,
    toolbarCloseText: 'Готово'
});

$rootScope.MoneyKeypad = Olymp.fw7.app.keypad({
    input: '.mask_money',
    dotButton: true,
    toolbarCloseText: 'Готово'
});

$rootScope.PhoneKeypad = Olymp.fw7.app.keypad({
    input: '.mask_phone',
    valueMaxLength: 13,
    dotButton: false,
    toolbarCloseText: 'Готово'
});
$rootScope.PhoneKeypad2 = Olymp.fw7.app.keypad({
    input: '.mask_phone2',
    valueMaxLength: 13,
    dotButton: false,
    toolbarCloseText: 'Готово'
});

$scope.$watch('PhoneInput', function() {
  if ((!$scope.PhoneInput)||(!$scope.PhoneInput[3])){
    $scope.PhoneInput = "+7 ";
    $rootScope.PhoneKeypad.value = "+7 ";
    $rootScope.PhoneKeypad2.value = "+7 ";
  }
  });

/*-----------Banner Slider------------*/
var Banners = Olymp.fw7.app.swiper('.swiper-container', {
    autoplay: 3000,
    speed: 400,
    spaceBetween: 100
}); 
/*----------Navigation functions-----------*/

$rootScope.Goto = function(id,tab){
  Olymp.fw7.app.views[0].router.loadPage(id);
  if (tab) {Olymp.fw7.app.showTab(tab)}
  Olymp.fw7.app.closePanel();
}

$rootScope.GotoContact = function () {
  Olymp.fw7.app.views[0].router.loadPage("#contact");
  document.getElementById('help-name').value = $rootScope.user.full_name;
  document.getElementById('help-email').value = $rootScope.user.email;
  document.getElementById('help-phone').value = $rootScope.user.phone_mobile;
  Olymp.fw7.app.closePanel();
};

$rootScope.OpenNewSale = function() {
  $rootScope.selected_sale = -1;
  $rootScope.sell = [];
  document.getElementById('products-dropdown').value = "";
  document.getElementById('prod-num').value = "";
  document.getElementById('billImage').src = "";
  $rootScope.calendarDefault.value = [new Date()];
  document.getElementById('calendar-sell').value = moment().format("DD.MM.YYYY");
  $rootScope.billView = {};

  Olymp.fw7.app.views[0].router.loadPage("#sale");
}
$rootScope.OpenSertificate = function(num){
  $rootScope.selected_card = num;
  document.getElementById("picker-nominal").value = "";
  document.getElementById("picker-amount").value = "1";

  var str=$rootScope.sertificates[$rootScope.selected_card].standard_nominals_raw.replace(/ /g, "").replace(/;/g, ",");
  $rootScope.nominals = str.split(",");

  if ($rootScope.sertificates[$rootScope.selected_card].nominals_raw.search(/-/)!=-1){
    var min_index = $rootScope.sertificates[$rootScope.selected_card].nominals_raw.search(/-/);
    var max_index = $rootScope.sertificates[$rootScope.selected_card].nominals_raw.search(/:/);
    var min_sum = parseInt($rootScope.sertificates[$rootScope.selected_card].nominals_raw.slice(0,min_index));
    var max_sum = parseInt($rootScope.sertificates[$rootScope.selected_card].nominals_raw.slice(min_index+1,max_index));
    var step = parseInt($rootScope.sertificates[$rootScope.selected_card].nominals_raw.slice(max_index+1));
    $rootScope.all_nominals = [];
    for (var i = 0; i <= (max_sum-min_sum)/step; i++) {
      var s = min_sum+i*step;
      $rootScope.all_nominals.push(s);
    }

  } else {
    $rootScope.all_nominals = [];
    var str=$rootScope.sertificates[$rootScope.selected_card].nominals_raw.replace(/ /g, "").replace(/;/g, ",");
    $rootScope.all_nominals = str.split(",");
  }

  //console.log($rootScope.all_nominals);
  $rootScope.pickerSum = Olymp.fw7.app.picker({
    input: '#picker-nominal',
    toolbarCloseText: 'Готово',
    cols: [
        {
            textAlign: 'center',
            values: $rootScope.all_nominals
        }
    ]
});

  $rootScope.autocompleteDropdownAll = Olymp.fw7.app.autocomplete({
    input: '#autocomplete-nominal',
    openIn: 'dropdown',
    source: function (autocomplete, query, render) {
        var results = [];
        for (var i = 0; i < $rootScope.nominals.length; i++) {
            if ($rootScope.nominals[i].indexOf(query.toLowerCase()) >= 0) results.push($rootScope.nominals[i]);
        }
        render(results);
    }
});
  $rootScope.refresh();
  Olymp.fw7.app.views[0].router.loadPage("#buy-sertificate");
}

$rootScope.Logout = function () {
  Olymp.fw7.app.closePanel();
  localStorage["OlympID"] = "";
  Olymp.fw7.app.loginScreen();
}

/*-----------functions for ng-if------------*/

/*$rootScope.IsWide = function () {
  return $("#lpan").hasClass("panel-visible-by-breakpoint")
}*/

/*-----------Regular functions------------*/


$rootScope.refresh = function() {
//helps to update changing inputs
$timeout(function () {
    $scope.$apply();
    },50)
}

$rootScope.TakePhoto = function(){
  navigator.camera.getPicture(
  function success(imageData) {
     var image = document.getElementById('billImage');
     image.src =  'data:image/jpg;base64,'+imageData;
     $rootScope.image = imageData;
     $rootScope.SetPhoto('data:image/jpg;base64,'+imageData);
  }, 

  function error(error) {
    Olymp.fw7.app.alert("Не получилось сделать фотографию.");
  },
  {destinationType: Camera.DestinationType.DATA_URL});
}

$rootScope.SetPhoto = function (photo) {
  $rootScope.billView = Olymp.fw7.app.photoBrowser({
    photos : [photo],
    theme: 'dark',
    type: 'standalone',
    toolbar: false,
      ofText: 'из'
});
}


$rootScope.ForgotPass = function(){
  Olymp.fw7.app.prompt('Введите свой номер телефона', function (value) {
    $rootScope.phone = value;
    $rootScope.TokenPass(value);
  });

}

$rootScope.SetupProfile = function(profile){
  Olymp.fw7.app.closeModal();
      localStorage["OlympID"] = profile.profile_id;
  $rootScope.user = profile;
  console.log(profile);

  $rootScope.GetInfo('sales/api/sales/sales',
    {'profile_id' : localStorage["OlympID"]},
    {'sales_array':'sales'});
 
  $rootScope.GetInfo('sales/api/sales/products',
    {"dealer_name": $rootScope.user.dealer.name},
    {'products':'products'});

  $rootScope.GetInfo('sales/api/sales/transaction-history',
    {'profile_id' : localStorage["OlympID"]},
    {'transactions':'transactions',
    'cards_history':'sertificates'},
    function(){
      for (var i = 0; i < $rootScope.cards_history.length; i++) {
        var message = '';
        switch ($rootScope.cards_history[i].cards[0].status){
          case 'new' : message = 'Новый'; break;
          case 'ordered' : message = 'Передан в заказ'; break;
          case 'partiallyReady' : message = 'Частично выдан'; break;
          case 'ready' : message = 'Полностью выдан'; break;
          case 'rejected' : message = 'Отказ'; break;
          case 'userCancel' : message = 'Отмена участником'; break;
          default: message = "";
        }
        $rootScope.cards_history[i].status = message;
      }
    });
       
  $rootScope.GetInfo('profiles/api/ndfl/ndfl-info',
    {'profile_id' : localStorage["OlympID"]},
    {'ndfl_countries':'countries',
    'ndfl_doctypes':'doc_types',
    'ndfl_form':'form'}
    );
  $rootScope.GetInfo('/payments/api-v3/payments/by-profile',
    {"profile_id": $rootScope.user.profile_id},
    {'payments':'payments'});

  $rootScope.GetInfo('sales/api/sales/cards',{},
    {'sertificates':'cards'});

  $rootScope.GetInfo('sales/api/sales/feedback-categories',{},
    {'feedback_categories':'categories'});

  $rootScope.GetInfo('sales/api/sales/competition',{},
     {'contest_users':'top',
      'contest_desc':'desc'});
   //function(response){$rootScope.contest_plaintext = response.data.desc.replace(/(<([^>]+)>)/ig,"")}
}


$rootScope.IfShowAddProductButton = function(){
 if ((document.getElementById('products-dropdown').value == "")||($rootScope.serial.length == 0)){
  return false} else {return true}
}

$rootScope.IfNdflFilled = function(){
  if ($rootScope.ndfl_form.is_fulfilled){
    return true} else {return false}
}

$rootScope.AddProduct = function(){
    var prod = Olymp.fw7.app.formToJSON('#product-form');
    for (var i = 0; i < $rootScope.products.length; i++) {
      if ($rootScope.products[i].name == prod.name) {
        prod.id = $rootScope.products[i].id;
        prod.category_id = $rootScope.products[i].category_id;
      }
    }
    $rootScope.sell.push(prod);
    document.getElementById('products-dropdown').value = "";
    document.getElementById('prod-num').value = "";
}

$rootScope.DeleteProduct = function(i){
  $rootScope.sell.splice(i,1);
}


$rootScope.EditSale = function(){
  $rootScope.sell = [];
  var products_array = $rootScope.sales_array[$rootScope.selected_sale].positions;
  for (var i = 0; i < products_array.length; i++) {
    $rootScope.sell.push({'name': products_array[i].product.name,
      'serial_number': products_array[i].custom_serial,
      'id': products_array[i].product.id,
      'category_id': products_array[i].product.category.id
    });
  }
  var re = /([0-9]+).([0-9]+).([0-9]+)/;
  var swapMonthDay = $rootScope.sales_array[$rootScope.selected_sale].sold_on.replace(re, '$2.$1.$3');
  $rootScope.calendarDefault.value[0] = swapMonthDay;
  document.getElementById('calendar-sell').value = $rootScope.sales_array[$rootScope.selected_sale].sold_on;
  document.getElementById('products-dropdown').value = "";
  document.getElementById('prod-num').value = "";
  var image = document.getElementById('billImage');
  image.src = $rootScope.sales_array[$rootScope.selected_sale].documents[0].image_url;
  $rootScope.SetPhoto($rootScope.sales_array[$rootScope.selected_sale].documents[0].image_url);
  Olymp.fw7.app.views[0].router.loadPage("#sale");
}

$rootScope.WarnCard = function(){
  Olymp.fw7.app.alert('Обратите внимание, что обработка заказов на нестандартные номиналы может занять больше времени.')
}

$rootScope.ShowError = function(err) {
  var error = '';
  for (var key in err){
      error = error + err[key] + '\n'
  }
  Olymp.fw7.app.alert(error, 'Ошибка!');
}


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

$rootScope.BuySertificate = function(){
    Olymp.fw7.app.showPreloader(["Подождите..."]);
 var info = Olymp.fw7.app.formToJSON('#sertificate-form');
 if (info.nominal!=-1){
  info.nominal = $rootScope.nominals[info.nominal];
 } else {
  info.nominal = info.special_nominal;
 };
  info.type = $rootScope.sertificates[$rootScope.selected_card].type;
  var json = {
    cards: [info],
    profile_id : localStorage["OlympID"],
    is_allow_cancel: 1,
    action: 'create'
  };
  console.log(json);

  var req = {
   method: 'POST',
   url: $rootScope.REST_URL+'sales/api/sales/buy-sertificate',
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

}]);