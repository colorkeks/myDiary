class Users::OmniauthCallbacksController < Devise::OmniauthCallbacksController
  def google_oauth2
    @user = User.find_for_google_oauth2(request.env["omniauth.auth"], current_user)

    if @user
      flash[:notice] = I18n.t "devise.omniauth_callbacks.success", :kind => "Google"
      sign_in_and_redirect @user, :event => :authentication
    else
      redirect_to new_user_session_path, notice: 'Access Denied'
    end
  end

  def check_permissions
    authorize! :create, resource
  end



  # def refresh_token
  #   data = {
  #       :client_id => GOOGLE_KEY,
  #       :client_secret => GOOGLE_SECRET,
  #       :refresh_token => REFRESH_TOKEN,
  #       :grant_type => "refresh_token"
  #   }
  #   @response = ActiveSupport::JSON.decode(RestClient.post "https://accounts.google.com/o/oauth2/token", data)
  #   if @response["access_token"].present?
  #     # Save your token
  #   else
  #     # No Token
  #   end
  # rescue RestClient::BadRequest => e
  #   # Bad request
  # rescue
  #   # Something else bad happened
  # end
end