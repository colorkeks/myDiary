// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or any plugin's vendor/assets/javascripts directory can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// compiled file.
//
// Read Sprockets README (https://github.com/rails/sprockets#sprockets-directives) for details
// about supported directives.
//
//= require jquery
//= require jquery_ujs
//= require jquery-ui
//= require twitter/bootstrap
//= require turbolinks
//= require_tree .


$(function() {
    $('.hour-event').resizable({
        handles: 's',
        minHeight: 110,
        stop: function (event, ui) {
            var top = ui.position.top;
            var height = ui.size.height;
            var startHour=  Math.floor(top / 220);
            var startMinute = Math.floor(((top - startHour * 220) * 60) / 220);
            var endHour = Math.floor((height + top)/220);
            var endMinute = Math.floor(((height + top - endHour * 220) * 60) / 220 + 1) ;

            if (endMinute >= 60){
                endHour += 1;
                endMinute = 0;
            }


            alert(startHour + ':' + startMinute + "\r\n" + endHour + ':' + endMinute);
            // Сделать ajax запрос который бы сохранял данные в бд
        }
    });


});
