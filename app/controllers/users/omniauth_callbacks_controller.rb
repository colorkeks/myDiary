class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController

  def check_permissions
    authorize! :create, resource
  end

end