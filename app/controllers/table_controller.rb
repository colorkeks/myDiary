class TableController < ApplicationController
  def index
    @calendar_events = CalendarEvent.all
    @calendar_event = CalendarEvent.new
  end
end