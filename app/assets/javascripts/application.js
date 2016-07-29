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
//= require_tree .


$(function() {
    $('.hour-event').draggable({
        axis: "y",
        containment: "parent",
        stop: function (event, ui) {
            var height = ui.helper.height();
            calc_datetime(event, ui, height)
        }
    });

    $('.hour-event').resizable({
        handles: 's',
        minHeight: 110,
        containment: "parent",
        stop: function (event, ui) {
            var height = ui.size.height;        //нет бы сделать как в resizable
            calc_datetime(event, ui, height)
        }
    });


    function calc_datetime(event, ui, height) {
        var event_id = event.target.id;
        var start_date = new Date($(event.target).data('start-date'));
        var end_date = new Date($(event.target).data('end-date'));

//    На основе высоты и отступа считаем время
        var top = ui.position.top;
        var startHour=  Math.floor(top / 220);
        var startMinute = Math.floor(((top - startHour * 220) * 60) / 220);
        var endHour = Math.floor((height + top)/220);
        var endMinute = Math.floor(((height + top - endHour * 220) * 60) / 220 + 1) ;

        if (endMinute >= 60){
            endHour += 1;
            endMinute = 0;
        }

        start_date.setHours(startHour);
        start_date.setMinutes(startMinute);
        end_date.setHours(endHour);
        end_date.setMinutes(endMinute);
        $(event.target).find('.start_date').text(start_date.getHours() + ':' + start_date.getMinutes() + ' - ');
        $(event.target).find('.end_date').text(end_date.getHours() + ':' + end_date.getMinutes());

        $.ajax({
            type: "POST",
            url: "/calendar_events/" + event_id + "/ajax_update"  ,
            dataType: 'JSON',
            data: {calendar_event:{start_date: start_date, end_date: end_date, all_day: (start_date.getDate() != end_date.getDate())}, _method: 'put'}
        }).done(function( result ) {
            (console.log(result))
        });
    }
});
