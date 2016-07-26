class TableController < ApplicationController
  def index
    @calendar_event = CalendarEvent.new
  end
end