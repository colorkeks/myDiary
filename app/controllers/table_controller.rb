class TableController < ApplicationController
  def index
    if current_user
      @user = User.find(current_user.id)
      @calendar_events = @user.calendar_events
      @calendar_event = CalendarEvent.new
    else
      redirect_to new_user_session_path
    end
  end
end