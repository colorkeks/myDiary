class User  < ActiveRecord::Base
  has_many :calendar_events
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable, :omniauthable

end