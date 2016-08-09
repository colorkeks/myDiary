class CalendarEventsController < ApplicationController
  before_action :set_calendar_event, only: [:ajax_update, :show, :edit, :update, :destroy]
  respond_to :html, :json

  # GET /calendar_events
  # GET /calendar_events.json
  def index
    @calendar_events = CalendarEvent.all
  end

  # GET /calendar_events/1
  # GET /calendar_events/1.json
  def show
  end

  # GET /calendar_events/new
  def new
    @calendar_event = CalendarEvent.new(params[:calendar_event].nil? ? nil : calendar_event_params )
    respond_modal_with @calendar_event
  end

  # GET /calendar_events/1/edit
  def edit
    respond_modal_with @calendar_event
  end

  def create
    @calendar_event = CalendarEvent.new(calendar_event_params)
    @calendar_event.uid = SecureRandom.hex
    @calendar_event.save
    respond_modal_with @calendar_event, :location => :back
  end

  def ajax_update
    if request.xhr?
      if @calendar_event.update(calendar_event_params)
        render json: {status: 'success', message: 'Event saved!'}
      else
        render json: {status: 'failure', message: 'Event save error!'}
      end
    end
  end

  # PATCH/PUT /calendar_events/1
  # PATCH/PUT /calendar_events/1.json
  def update
    @calendar_event.update(calendar_event_params)
    respond_modal_with @calendar_event, :location => :back
  end

  # DELETE /calendar_events/1
  # DELETE /calendar_events/1.json
  def destroy
    @calendar_event.destroy
    respond_modal_with @calendar_event, :location => :back
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_calendar_event
    @calendar_event = CalendarEvent.find(params[:id])
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def calendar_event_params
    params.require(:calendar_event).permit(:uid, :title, :all_day, :start_date, :end_date)
  end
end
