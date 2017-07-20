Olymp.angJS.service('DeclareService', [ '$rootScope',function ($rootScope) {

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


/*-----------Banner Slider------------*/
var Banners = Olymp.fw7.app.swiper('.swiper-container', {
    autoplay: 3000,
    speed: 400,
    spaceBetween: 100,
    autoplayDisableOnInteraction: false
}); 
    
}]);