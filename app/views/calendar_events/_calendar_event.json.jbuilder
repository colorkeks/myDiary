json.extract! calendar_event, :id, :title, :all_day, :start_date, :end_date, :created_at, :updated_at
json.url calendar_event_url(calendar_event, format: :json)