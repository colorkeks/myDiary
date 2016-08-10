class CalendarEvent < ActiveRecord::Base
  belongs_to :user

  validates_presence_of :start_date, :end_date, :title

  validate :end_date_is_after_start_date, :check_all_day


  private

  def check_all_day
    if !all_day
      # если не all_day но несколько дней
      if(end_date.to_date - start_date.to_date) > 0
        errors.add(:all_day, 'Что-то тут не так')
      end
      # если не all_day и меньше получаса (все криво)
      if 1799 >= (end_date.to_time - start_date.to_time)
        errors.add(:end_date, 'Длительность должна быть не менее получаса')
      end
    end
  end

  def end_date_is_after_start_date
    return if end_date.blank? || start_date.blank?

    if end_date < start_date
      errors.add(:start_date, 'Start_date должен быть раньше чем End_date')
    end
  end

end
