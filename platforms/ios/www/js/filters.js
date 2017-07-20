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
      else if (x<=1000) {message = "Неплохое начало!"}
      else if (x>1000) {message = "Отличный результат!"}
    return message;
    }
});
