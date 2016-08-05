function events_listeners() {
    var modal_holder_selector, modal_selector;
    modal_holder_selector = '#modal-holder';
    modal_selector = '.modal';

    // Типа ресайз который drag :D
    $('.event-resizable').draggable({
        containment: $(this).parents().find('.drag-container'),
        helper: 'clone',
        start: function () { //hide original when showing clone
            on_drag_start($(".ui-draggable-dragging").parent());
            $('*[data-id=' + $(this).parent().data('id') + ']').show();

        },
        stop: function () { //show original when hiding clone
            on_drag_stop(this);
        }
    });

    // TODO МБ ЗАМОРОЧИТЬСЯ НАД СТИЛИЗАЦИЕЙ КЛОНА
    $('.to_all_day').draggable({
        containment: $('.diary'),
        helper: 'clone',
        appendTo: $('.diary')
    });

// DRAGGABLE, CLICK(THIS_EVENT) В разрезе месяца и allday
    $('.week_event').draggable({
        revert: 'invalid',
        scroll: false,
        containment: $(this).parents().find('.drag-container'),
        helper: 'clone',
        start: function () { //hide original when showing clone
            on_drag_start($(".ui-draggable-dragging"));
        },
        stop: function () { //show original when hiding clone
            on_drag_stop(this);
        }
    }).click(function () {
        show_event(this);
    });

// DROPPABLE, CLICK(NEW_EVENT) В разрезе месяца и allday
    $('.date').droppable({
        drop: function () {
            $(this).css('background', 'rgba(133, 255, 179, 0.66)');
            var event;
            // проверка на то ресайзится эвент или переносится
            if ($(".ui-draggable-dragging").hasClass('event-resizable')) {
                event = $(".ui-draggable-dragging").parent();
                ajax_event_update(event.data('id'), new Date(event.data('start-date')), new Date($(this).data('date')), event.data('all_day'), true);
            }
            else if ($(".ui-draggable-dragging").hasClass('to_all_day')) {
                event = $(".ui-draggable-dragging");
                ajax_event_update(event.data('id'), new Date($(this).data('date')), new Date($(this).data('date')), true, true);
            }
            else {
                event = $(".ui-draggable-dragging");
                var dates = get_new_start_and_end_date($(this).data('date'), event.data('start-date'), event.data('end-date'));
                ajax_event_update(event.data('id'), dates[0], dates[1], event.data('all-day'), true);
            }
        },
        over: function () {
            $(this).css('background', 'red')
        },
        out: function () {
            $(this).css('background', 'rgba(133, 255, 179, 0.66)')
        }
    }).click(function () {
        new_event($(this).data('date'), $(this).data('all-day'))
    });

// DROPPABLE В разрезе ДНЯ И НЕДЕЛИ (ЧАСЫ/NOT_ALL_DAY)
    $('.hour-date').droppable({
        accept: '.week_event',
        drop: function () {
            $(this).css('background', 'transparent');
            var newStartDate = new Date($(this).data('date'));
            newStartDate.setHours(0);
            newStartDate.setMinutes(0);
            var newEndDate = new Date(newStartDate);
            newEndDate.setHours(1);

            ajax_event_update($(".ui-draggable-dragging").data('id'), newStartDate, newEndDate, false, true);
        },
        over: function () {
            $(this).css('background', 'rgba(133, 255, 179, 0.66)')
        },
        out: function () {
            $(this).css('background', 'transparent')
        }
    }).click(function () {
        var date = $(this).data('date');
        var all_day = $(this).data('all-day');
        // костыль чтобы модалки криво не открывались
        setTimeout(function () {
            if ($('#mainModal').hasClass('in') || $('.hour-event').data('dragging/resizable')) return;
            new_event(date, all_day)
        }, 100)
    });

// DRAGGABLE, RESIZABLE, CLICK(THIS_EVENT) В разрезе ДНЯ И НЕДЕЛИ (ЧАСЫ/NOT_ALL_DAY)
    $('.hour-event').draggable({
        axis: "x, y",
        grid: [117, 1],
        containment: $('.event_hour_table'),

        start: function (event, ui) {
            hour_event_on_drag_resize_start(this);
        },
        stop: function (event, ui) {
            hour_event_on_drag_resize_stop(event, ui, true);
        },
        drag: function (event, ui) {
            hour_event_on_drag_resize(event, ui, ui.helper.height())
        }
    }).resizable({
        handles: 's',
        minHeight: 50,
        containment: "parent",
        start: function (event, ui) {
            hour_event_on_drag_resize_start(this);
        },
        stop: function (event, ui) {
            hour_event_on_drag_resize_stop(event, ui, false);
        },
        resize: function (event, ui) {
            hour_event_on_drag_resize(event, ui, ui.size.height)
        }
    }).click(function () {
        show_event(this);
    });

// AJAX ОБНОВЛЕНИЕ ЭВЕНТА, и reload страницы(Turbolinks)
    function ajax_event_update(event_id, start_date, end_date, all_day, reload) {
        // all_day = all_day || false;
        $.ajax({
            type: "POST",
            url: "/calendar_events/" + event_id + "/ajax_update",
            dataType: 'JSON',
            data: {calendar_event: {start_date: start_date, end_date: end_date, all_day: all_day}, _method: 'put'}
        }).done(function (result) {
            //  TODO ПЕРЕЗАГРУЖАТЬ НЕ ВСЮ СТРАНИЦУ А ТОЛЬКО PARTIAL C ПОМОЩЬЮ ESCAPE_JAVASCRIPT
            if (reload) {
                Turbolinks.clearCache();
                Turbolinks.visit(location);
            }
            else
                console.log(result);
        });
    }

    function show_event(_this) {
        if ($(_this).data('dragging/resizable')) return;
        $.ajax({
            type: "GET",
            url: "/calendar_events/" + $(_this).data('id')+ '/edit',
            success: function (data) {
                $(modal_holder_selector).html(data).find(modal_selector).modal();
            }
        }).done(function (result) {
            (console.log('ok'))
        });
    }

    function new_event(start_date, all_day) {
        $.ajax({
            type: "GET",
            url: "/calendar_events/new",
            data: {calendar_event: {start_date: start_date, end_date: start_date, all_day: all_day}},
            success: function (data) {
                $(modal_holder_selector).html(data).find(modal_selector).modal();
            }
        }).done(function (result) {
            (console.log('ok'))
        });
    }

// HELPERS
    function get_new_start_and_end_date(newStartDate, oldStartDate, oldEndDate) {
        newStartDate = new Date(newStartDate);
        oldStartDate = new Date(oldStartDate);
        oldEndDate = new Date(oldEndDate);

        // Расчет стартовой даты
        newStartDate.setHours(oldStartDate.getHours());
        newStartDate.setMinutes(oldStartDate.getMinutes());

        // Расчет конечной даты
        var newEndDate = new Date(oldEndDate);
        var delta = new Date(newStartDate - oldStartDate);
        newEndDate.setDate(oldEndDate.getDate() + Math.round(delta / 1000 / 60 / 60 / 24));

        return [newStartDate, newEndDate];
    }

    function calc_date(dates, ui) {
        var start_date = dates[0];
        var end_date = dates[1];
        var left = ui.position.left;

        start_date.setDate(start_date.getDate() + Math.floor(left / 110));
        end_date.setDate(end_date.getDate() + Math.floor(left / 110));

        return [start_date, end_date];
    }

    function calc_datetime(event, ui, height) {
        var start_date = new Date($(event.target).data('start-date'));
        var end_date = new Date($(event.target).data('end-date'));

//    На основе высоты и отступа считаем время
        var top = Math.abs(ui.position.top);
        var startHour = top / 100;
        var startMinute = Math.floor(((top % 100) * 60) / 100);

        var endHour = Math.floor((height + top) / 100);
        var endMinute = Math.floor(((height + top - endHour * 100) * 60) / 100);

        start_date.setHours(startHour);
        start_date.setMinutes(startMinute);
        end_date.setHours(endHour);
        end_date.setMinutes(endMinute);

        return [start_date, end_date];
    }

    function change_event_time(event, start_date, end_date) {
        $(event.target).find('.start_date').text(AddZero(start_date.getHours()) + ':' + AddZero(start_date.getMinutes()) + ' - ');
        $(event.target).find('.end_date').text(AddZero(end_date.getHours()) + ':' + AddZero(end_date.getMinutes()));
    }

    function AddZero(num) {
        return (num >= 0 && num < 10) ? "0" + num : num + "";
    }

    function on_drag_start(holder) {
        $('.event').hide();
        $(holder).show();
    }

    function on_drag_stop(_this) {
        $(_this).show();
        $('.event').show();
    }

    function hour_event_on_drag_resize(event, ui, height){
        var  dates = calc_datetime(event, ui, height);
        change_event_time(event, dates[0], dates[1]);
    }

    function hour_event_on_drag_resize_start() {
        $(this).data('dragging/resizable', true);
    }

    function hour_event_on_drag_resize_stop(event, ui, isDraggable) {
        var height = isDraggable ? ui.helper.height() : ui.size.height;
        var dates = calc_datetime(event, ui, height);
        if (isDraggable) {
            dates = calc_date(dates, ui);
        }
        ajax_event_update($(event.target).data('id'), dates[0], dates[1], $(event.target).data('all-day'), false);
        setTimeout(function () {
            $(event.target).data('dragging/resizable', false);
        }, 1);
    }
}