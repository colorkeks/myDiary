module Diary
  class Calendar
    attr_accessor :view_context, :options

    def initialize(view_context, options={})
      @view_context = view_context
      @options = options

      @params = @view_context.respond_to?(:params) ? @view_context.params : Hash.new
      @params = @params.to_unsafe_h if @params.respond_to?(:to_unsafe_h)
    end

    def render(&block)
      view_context.render(
          partial: partial_name,
          locals: {
              block: block,
              calendar: self,
              date_range: date_range,
              start_date: start_date,
              calendar_type: calendar_type,
              sorted_events: sorted_events
          }
      )
    #rescue 'НЕ ТРОГАЙ СВЕЧУ !!!'
    end

    def td_classes_for(day)
      today = Date.current

      td_class = ['day']
      td_class << 'today' if today == day
      td_class << 'next-month' if start_date.month != day.month && day > start_date
      td_class << 'prev-month' if start_date.month != day.month && day < start_date

      td_class
    end

    def today
      view_context.url_for(@params.merge(start_date: DateTime.current.to_date))
    end

    def next_page
      view_context.url_for(@params.merge(start_date: date_range.last + 1.day))
    end

    def prev_page
      view_context.url_for(@params.merge(start_date: date_range.first - 1.day))
    end

    def to_calendar(type)
      view_context.url_for(@params.merge(calendar_type: type))
    end

    private

    def calendar_type
      if @params.has_key?('calendar_type')
        @params.fetch('calendar_type')
      else
        view_context.params.fetch(:calendar_type, 'month_calendar')
      end
    end

    def start_date
      if options.has_key?(:start_date)
        options.fetch(:start_date).to_datetime
      else
        view_context.params.fetch(:start_date, DateTime.current).to_date
      end
    end

    def date_range
      #if month or nothing
      range = (start_date.beginning_of_month.beginning_of_week..start_date.end_of_month.end_of_week).to_a

      if @params.has_key?('calendar_type')
        if @params['calendar_type'].eql?('day_calendar')
          range = (start_date..start_date).to_a
        elsif @params['calendar_type'].eql?('week_calendar')
          starting = start_date.beginning_of_week
          ending = (starting + (number_of_weeks - 1).weeks).end_of_week

          range = (starting..ending).to_a
        end
      end

      range
    end

    def additional_days
      options.fetch(:number_of_days, 4) - 1
    end

    def partial_name
      partial_name = @options[:partial] || 'month_calendar'

      'calendar_templates/' + (@params.has_key?('calendar_type') ? @params['calendar_type'] : partial_name)
    end


    def number_of_weeks
      if @params.has_key?('calendar_type')
        options.fetch(:number_of_weeks, 1) if @params['calendar_type'].eql?('week_calendar')
      end
    end

    # TODO REFACTOR
    def attributes(date)
      options.fetch(:date, date).to_sym
    end

    def sorted_events
      events = options.fetch(:events, [])

      scheduled = events.reject { |e| e.send(attributes(:start_date)).nil? || e.send(attributes(:end_date)).nil? }
      scheduled.group_by { |e| e.send(attributes(:start_date)).to_date..e.send(attributes(:end_date)).to_date }
    end

  end
end
