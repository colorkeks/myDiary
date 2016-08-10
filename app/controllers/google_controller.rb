class GoogleController < ApplicationController
  include GoogleHelper
  before_action :set_user, only: [:set_service, :redirect, :callback, :import_events, :export_events]
  before_action :set_service, only: [:import_events, :export_events]


  #=begin получение доступа к google calendar по cliend_id и client_secret
  def redirect
    client = Signet::OAuth2::Client.new({
                                            client_id: @user.client_id,
                                            client_secret: @user.client_secret,
                                            authorization_uri: 'https://accounts.google.com/o/oauth2/auth',
                                            scope: Google::Apis::CalendarV3::AUTH_CALENDAR,
                                            redirect_uri: url_for(action: :callback)
                                        })

    redirect_to client.authorization_uri.to_s
  end

  def callback
    client = Signet::OAuth2::Client.new({
                                            client_id: @user.client_id,
                                            client_secret: @user.client_secret,
                                            token_credential_uri: 'https://accounts.google.com/o/oauth2/token',
                                            redirect_uri: url_for(action: :callback),
                                            code: params[:code]
                                        })

    response = client.fetch_access_token!
    @user.update(token: response['access_token'])

    redirect_to url_for(action: session[:return_to])
  end
  #=end

  #=begin import google calendar events into myCalendar
  def import_events
    # не уверен как правильно проверить валидность ключа
    begin
      response = @service.list_events(@user.calendar_id,
                                      single_events: true,
                                      order_by: 'startTime')
    rescue
      session[:return_to] = 'import_events'
      redirect_to url_for(action: :redirect)
      return
    end

    response.items.each do |event|
      calendar_event = CalendarEvent.find_or_initialize_by(uid: event.id)
      calendar_event.update_attributes(uid: event.id, title: event.summary, start_date: event.start.date_time || event.start.date,
                                       end_date: event.end.date_time || event.end.date, all_day: event.start.date_time.nil? ? true : false,
                                       user_id: @user.id)
    end

    redirect_to url_for(controller: :table, action: :index)
  end

  #=end


  def export_events
    begin
      # проверить ключ на валидность (например так)
      @service.get_calendar_list(@user.calendar_id)
    rescue
      session[:return_to] = 'export_events'
      redirect_to url_for(action: :redirect)
      return
    end

    @user.calendar_events.each do |event|
      # если события в гугл календаре еще нету
      if event.uid.nil?
        new_google_event(@service, @user.calendar_id, event)
        event.update_attribute(:uid, result.id)
      #  если есть событие в гугл календаре
      else
        update_google_event(@service, @user.calendar_id, event)
      end
    end

    redirect_to url_for(controller: :table, action: :index)
  end

  def set_user
    @user = User.find(current_user.id)
  end

  def set_service
    @service = Google::Apis::CalendarV3::CalendarService.new
    @service.authorization = AccessToken.new(@user.token)
  end
end