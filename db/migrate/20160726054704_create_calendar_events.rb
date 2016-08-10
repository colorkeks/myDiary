class CreateCalendarEvents < ActiveRecord::Migration
  def change
    create_table :calendar_events do |t|
      t.string  :uid
      t.string :title
      t.boolean :all_day
      t.datetime :start_date
      t.datetime :end_date
      t.integer :user_id

      t.timestamps null: false
    end

    add_index :calendar_events, :uid, unique: true
  end
end
