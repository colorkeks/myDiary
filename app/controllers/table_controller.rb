class TableController < ApplicationController
  def index
    if current_user

      #   TODO сохранять данные Календаря (client_id, client_secret, token)
      #   TODO Инициализировать Календарь на основе сохраненных данных
      #   TODO Подтягивать эвенты календаря и сохранять в базу(если еще не сохранены)
      #   TODO Обновить или Сохранить новые эвенты в Google календаре

      @calendar_events = CalendarEvent.all
      @calendar_event = CalendarEvent.new
      @user = User.find(current_user.id)
    else
      redirect_to new_user_session_path
    end
  end
end