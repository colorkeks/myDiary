class CreateCalendarEvents < ActiveRecord::Migration
  def change
    create_table :calendar_events do |t|
      t.string :title
      t.boolean :all_day
      t.datetime :start_date
      t.datetime :end_date

      t.timestamps null: false
    end
  end
end
