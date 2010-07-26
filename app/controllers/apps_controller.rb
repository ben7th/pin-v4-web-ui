class AppsController < ApplicationController

  def index
    @apps = App.all
  end

  def installed
    @apps = current_user.installed_apps
    render :template=>"apps/index"
  end
end
