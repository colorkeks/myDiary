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
//= require turbolinks
//= require twitter/bootstrap
//= require_tree .


$(document).on('turbolinks:load', function () {
    $('.day').click(function() {
        alert($(this).data("date"));
    });

    $('.day_all').click(function() {
        alert($(this).data("date"));
    });

    $('.hour-event').draggable({
        axis: "y",
        containment: "parent",
        stop: function (event, ui) {
            var height = ui.helper.height();
            var dates = calc_datetime(event, ui, height);
            ajax_event_update(event.target.id, dates[0], dates[1])
        },
        drag: function (event, ui) {
            var height = ui.helper.height();
            var dates = calc_datetime(event, ui, height);
            change_event_time(event, dates[0], dates[1]);
        }
    });

    $('.hour-event').resizable({
        handles: 's',
        minHeight: 110,
        containment: "parent",
        stop: function (event, ui) {
            var height = ui.size.height;        //нет бы сделать как в resizable
            var dates = calc_datetime(event, ui, height);
            ajax_event_update(event.target.id, dates[0], dates[1])
        },
        resize: function (event, ui) {
            var height = ui.size.height;        //нет бы сделать как в resizable
            var dates = calc_datetime(event, ui, height);
            change_event_time(event, dates[0], dates[1]);
        }
    });


    function calc_datetime(event, ui, height) {
        var start_date = new Date($(event.target).data('start-date'));
        var end_date = new Date($(event.target).data('end-date'));

//    На основе высоты и отступа считаем время
        var top = ui.position.top;
        var startHour=  Math.floor(top / 100);
        var startMinute = Math.floor(((top - startHour * 100) * 60) / 100);
        var endHour = Math.floor((height + top)/100);
        var endMinute = Math.floor(((height + top - endHour * 100) * 60) / 100 + 1) ;

        if (endMinute >= 60){
            endHour += 1;
            endMinute = 0;
        }

        start_date.setHours(startHour);
        start_date.setMinutes(startMinute);
        end_date.setHours(endHour);
        end_date.setMinutes(endMinute);

        return [start_date, end_date];
    }

    function ajax_event_update(event_id, start_date, end_date) {
        $.ajax({
            type: "POST",
            url: "/calendar_events/" + event_id + "/ajax_update"  ,
            dataType: 'JSON',
            data: {calendar_event:{start_date: start_date, end_date: end_date, all_day: false}, _method: 'put'}
        }).done(function( result ) {
            (console.log(result))
        });
    }


    function change_event_time(event, start_date, end_date) {
        $(event.target).find('.start_date').text(AddZero(start_date.getHours()) + ':' + AddZero(start_date.getMinutes()) + ' - ');
        $(event.target).find('.end_date').text(AddZero(end_date.getHours()) + ':' + AddZero(end_date.getMinutes()));
    }


    function AddZero(num) {
        return (num >= 0 && num < 10) ? "0" + num : num + "";
    }
});
