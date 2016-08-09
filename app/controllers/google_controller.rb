class GoogleController < ApplicationController
  #=begin получение доступа к google calendar по cliend_id и client_secret
  def redirect
    client = Signet::OAuth2::Client.new({
                                            client_id: current_user.client_id,
                                            client_secret: current_user.client_secret,
                                            authorization_uri: 'https://accounts.google.com/o/oauth2/auth',
                                            scope: Google::Apis::CalendarV3::AUTH_CALENDAR_READONLY,
                                            redirect_uri: url_for(:action => :callback)
                                        })

    redirect_to client.authorization_uri.to_s
  end

  def callback
    client = Signet::OAuth2::Client.new({
                                            client_id: current_user.client_id,
                                            client_secret: current_user.client_secret,
                                            token_credential_uri: 'https://accounts.google.com/o/oauth2/token',
                                            redirect_uri: url_for(:action => :callback),
                                            code: params[:code]
                                        })

    response = client.fetch_access_token!

    session[:access_token] = response['access_token']

    redirect_to url_for(action: :import_events)
  end
  #=end

  #=begin import google calendar events into myCalendar
  def import_events
    access_token = AccessToken.new(session[:access_token])

    service = Google::Apis::CalendarV3::CalendarService.new
    service.authorization = access_token
    response = service.list_events(current_user.calendar_id,
                                   max_results: 10,
                                   single_events: true,
                                   order_by: 'startTime')

    @events = []

    response.items.each do |event|
      calendar_event = CalendarEvent.find_or_initialize_by(uid: event.id)
      calendar_event.update_attributes(uid: event.id ,title: event.summary, start_date: event.start.date_time || event.start.date,
                                       end_date: event.end.date_time || event.end.date, all_day: event.start.date_time.nil? ? true : false)
    end

    redirect_to url_for(controller: :table, action: :index)
  end
  #=end
end