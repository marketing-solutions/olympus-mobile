'use strict';

var Olymp = {};
var $$ = Dom7;
/*$$(document).on('deviceready', function() {
    console.log("Device is ready!");
    
});
*/

function onBackKeyDown() {

}

Olymp.config={};

Olymp.angJS = new angular.module('Olymp', []);
 

$$(document).on('DOMContentLoaded', function() {
Olymp.fw7 = {
  app : new Framework7({
    material: true,
    domCache: true,
    uniqueHistory:true,
    modalTitle: "Olympus",
    modalButtonOk: "ОК",
   // fastClicks: false,
    modalButtonCancel: "Отмена",
    modalPreloaderTitle: "Подождите...",
        swipePanel:"left",
    sortable: false,
    swipeout: false,
    scrollTopOnNavbarClick: true,
    swipePanelThreshold: 50,
    swipePanelActiveArea:50
  }),
  options : {
    domCache: true,
   
  },
  views : []
  };

});

$('.mask_phone').mask('+7 (999) 999-99-99');