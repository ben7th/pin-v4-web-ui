class SettingsController < ApplicationController
  def index
    redirect_to "/users/#{current_user.id}/edit"
  end
end