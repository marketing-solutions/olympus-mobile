

var Olymp = {};
var $$ = Dom7;
/*$$(document).on('deviceready', function() {
    console.log("Device is ready!");
    
});
*/

function onBackKeyDown() {
  if (localStorage["OlympID"]) {
    Olymp.fw7.app.closeModal();
    Olymp.fw7.app.views[0].router.back();
    }
}

Olymp.config={};

Olymp.angJS = new angular.module('Olymp', ['ngSanitize']);
 

$$(document).on('DOMContentLoaded', function() {
Olymp.fw7 = {
  app : new Framework7({
    material: true,
    domCache: true,
    uniqueHistory:true,
/*    animatePages: false,*/
    modalTitle: "Olympus",
    modalButtonOk: "ОК",
   // fastClicks: false,
    modalButtonCancel: "Отмена",
    modalPreloaderTitle: "Подождите...",
        swipePanel:"left",
    sortable: false,
    swipeout: false,
    swipePanelThreshold: 50,
    swipePanelActiveArea:150,
    modalUsernamePlaceholder: 'пароль',
    modalPasswordPlaceholder: 'повторите пароль'
  }),
  options : {
    domCache: true,
   
  },
  views : []
  };

});
