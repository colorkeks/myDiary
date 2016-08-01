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

    // DRAGGABLE В разрезе месяца и allday
    $('.week_event').draggable({
        revert: 'invalid',
        scroll: false,
        containment: $(this).parents().find('.drag-container'),
        helper: 'clone',
        start: function(){ //hide original when showing clone
            var this_id = $(this).data('id');
            $('*[data-id=' + this_id +  ']').hide();
            // $('.event').hide();
            $(".ui-draggable-dragging").show();
            $(this).parents().find('.event-content-container').css('overflow-y', 'visible').css('width', '100%');
        },
        stop: function(){ //show original when hiding clone
            $(this).show();
            // $('.event').show();
            $(this).parents().find('.event-content-container').css('overflow-y', 'scroll').css('width', 'calc(100% + 15px)');
        }
    }).click(function() {
        // TODO OPEN MODAL
        if($(this).data('dragging/resizable')) return;
        alert("TODO THIS EVENT MODAL");
    });

    // DROPPABLE В разрезе месяца и allday
    $('.date').droppable({
        drop: function(){
            $(this).css('background', 'rgba(133, 255, 179, 0.66)')
            var endDate = getNewEndDate($( this ).data('date'), $(".ui-draggable-dragging").data('start-date'), $(".ui-draggable-dragging").data('end-date'));
            ajax_event_update($(".ui-draggable-dragging").data('id'), $( this ).data('date'),  endDate, $(".ui-draggable-dragging").data('all-day'));
        //  TODO ПОДУМАТЬ КАК СДЕЛАТЬ БЫТРЕЙ
            Turbolinks.clearCache();
            Turbolinks.visit(location);



        },
        over: function(){
            $(this).css('background', 'red')
        },
        out: function(){
            $(this).css('background', 'rgba(133, 255, 179, 0.66)')
        }
    }).click(function() {
        alert("TODO NEW EVENT MODAL");
    });


    $('.hour-date').droppable({
        accept: '.week_event',
        drop: function(){
            $(this).css('background', 'transparent');
            var newStartDate= new Date($( this ).data('date'));
            newStartDate.setHours(0);
            newStartDate.setMinutes(0);
            var newEndDate = new Date(newStartDate);
            newEndDate.setHours(1);


            ajax_event_update($(".ui-draggable-dragging").data('id'), newStartDate,  newEndDate, false);
            Turbolinks.clearCache();
            Turbolinks.visit(location);
        },
        over: function(){
            $(this).css('background', 'rgba(133, 255, 179, 0.66)')
        },
        out: function(){
            $(this).css('background', 'transparent')
        }
    });


    function getNewEndDate(newStartDate, oldStartDate, oldEndDate){
        newStartDate = new Date(newStartDate);
        oldStartDate =  new Date(oldStartDate);
        oldEndDate = new Date(oldEndDate);


        var delta = new Date(newStartDate - oldStartDate);
        var date = new Date(oldEndDate);
        date.setDate(oldEndDate.getDate() + Math.round(delta / 1000 / 60 / 60/ 24) );
        return date;
    }

    $('.hour-event').draggable({
        axis: "x, y",
        grid: [110, 1],
        containment: $('.event_hour_table'),

        start: function(event, ui){
            $(this).data('dragging/resizable', true);
        },
        stop: function (event, ui) {
            var height = ui.helper.height();
            var dates = calc_datetime(event, ui, height);
            dates = calc_date(dates, ui);
            ajax_event_update($(event.target).data('id'), dates[0], dates[1], $(event.target).data('all-day'));
            setTimeout(function(){ $(event.target).data('dragging/resizable', false); }, 1);
        },
        drag: function (event, ui) {
            var height = ui.helper.height();
            var dates = calc_datetime(event, ui, height);
            change_event_time(event, dates[0], dates[1]);
        }
    }).resizable({
        handles: 's',
        minHeight: 110,
        containment: "parent",
        start: function(event, ui){
            $(this).data('dragging/resizable', true);
        },
        stop: function (event, ui) {
            var height = ui.size.height;        //нет бы сделать как в resizable
            var dates = calc_datetime(event, ui, height);
            ajax_event_update($(event.target).data('id'), dates[0], dates[1], $(event.target).data('all-day'));
            setTimeout(function(){ $(event.target).data('dragging/resizable', false); }, 1);
        },
        resize: function (event, ui) {
            var height = ui.size.height;        //нет бы сделать как в resizable
            var dates = calc_datetime(event, ui, height);
            change_event_time(event, dates[0], dates[1]);
        }
    }).click(function() {
        // TODO OPEN MODAL
        if($(this).data('dragging/resizable')) return;
        alert("TODO THIS EVENT MODAL");
    });

    function calc_date(dates, ui) {
        var start_date = dates[0];
        var end_date = dates[1];
        var left = ui.position.left;

        start_date.setDate(start_date.getDate() + Math.floor(left/110));
        end_date.setDate(end_date.getDate() + Math.floor(left/110));

        return [start_date, end_date];
    }


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

    function ajax_event_update(event_id, start_date, end_date, all_day) {
        all_day = all_day || false;
        $.ajax({
            type: "POST",
            url: "/calendar_events/" + event_id + "/ajax_update"  ,
            dataType: 'JSON',
            data: {calendar_event:{start_date: start_date, end_date: end_date, all_day: all_day}, _method: 'put'}
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
