class UsersController < ApplicationController
  before_action :set_user, only:[:update, :update_and_import, :update_and_export]


  def show
  end

  def create
  end

  def update
    @user.update(user_params)
    redirect_to url_for(controller: :table, action: :index)

  end

  def update_and_import
    if @user.update(user_params)
      redirect_to url_for(controller: :google, action: :import_events)
    else
      redirect_to :back, notice: 'Error'
    end
  end

  def update_and_export
    # if @user.update(user_params)
    #   redirect_to url_for(controller: :google, action: :redirect)
    # else
    #   redirect_to :back, notice: 'Error'
    # end
  end


  def set_user
    @user = User.find(current_user.id)
  end

  private
  def user_params
    params.require(:user).permit(:calendar_id, :client_id, :client_secret, :token, :refresh_token, :nickname, :email,
                                 :password, :password_confirmation)
  end
end