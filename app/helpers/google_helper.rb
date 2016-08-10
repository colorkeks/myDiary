module GoogleHelper

  def new_google_event(service, calendar_id, event)
    google_event = Google::Apis::CalendarV3::Event.new(
        summary: event.title,
        start: {
            date: event.all_day ? event.start_date.to_date : nil,
            date_time:  event.all_day ? nil : event.start_date.to_datetime
        },
        end: {
            date: event.all_day ? event.end_date.to_date : nil,
            date_time:  event.all_day ? nil : event.end_date.to_datetime
        }
    )
    service.insert_event(calendar_id, google_event)
  end

  def update_google_event(service, calendar_id, event)
    google_event = service.get_event(calendar_id, event.uid)
    google_event.summary = event.title

    # обновляем start_date с проверкой на all_day
    google_event.start.date = event.all_day ? event.start_date.to_date : nil
    google_event.start.date_time =  event.all_day ? nil : event.start_date.to_datetime

    # обновляем end_date с проверкой на all_day
    google_event.end.date = event.all_day ? event.end_date.to_date : nil
    google_event.end.date_time =  event.all_day ? nil : event.end_date.to_datetime

    service.update_event(calendar_id, google_event.id, google_event)
  end

end