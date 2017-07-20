Olymp.angJS.controller('mainController',[ '$http','$scope','$rootScope','$timeout','DomService','DeclareService','HttpService',
function($http,$scope,$rootScope,$timeout,DomService,DeclareService,HttpService){
  'use strict';
  var Ctrl = this;
/*-----------Wait for DOM------------*/
  DomService.addEventListener('ready', function () {
    console.log('mainController: ok, DOM ready');
      });

/*-----------Some var-s for REST------------*/

$rootScope.REST_URL = "http://olympus.msforyou.ru/";

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

/*----------Watch phone input-----------*/

$scope.$watch('PhoneInput', function() {
  if ((!$scope.PhoneInput)||(!$scope.PhoneInput[3])){
    $scope.PhoneInput = "+7 ";
    $rootScope.PhoneKeypad.value = "+7 ";
    $rootScope.PhoneKeypad2.value = "+7 ";
  }
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
  Ctrl.selected_sale = -1;
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
 if ((document.getElementById('products-dropdown').value == "")||(document.getElementById('prod-num').value == "")) {
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
  var products_array = $rootScope.sales_array[Ctrl.selected_sale].positions;
  for (var i = 0; i < products_array.length; i++) {
    $rootScope.sell.push({'name': products_array[i].product.name,
      'serial_number': products_array[i].custom_serial,
      'id': products_array[i].product.id,
      'category_id': products_array[i].product.category.id
    });
  }
  var re = /([0-9]+).([0-9]+).([0-9]+)/;
  var swapMonthDay = $rootScope.sales_array[Ctrl.selected_sale].sold_on.replace(re, '$2.$1.$3');
  $rootScope.calendarDefault.value[0] = swapMonthDay;
  document.getElementById('calendar-sell').value = $rootScope.sales_array[Ctrl.selected_sale].sold_on;
  document.getElementById('products-dropdown').value = "";
  document.getElementById('prod-num').value = "";
  var image = document.getElementById('billImage');
  image.src = $rootScope.sales_array[Ctrl.selected_sale].documents[0].image_url;
  $rootScope.SetPhoto($rootScope.sales_array[Ctrl.selected_sale].documents[0].image_url);
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

}]);