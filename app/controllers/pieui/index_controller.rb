class Pieui::IndexController < ApplicationController
  def list
    name = params[:name]
    return redirect_to '/pieui/list/aboutul' if name.blank?
    render :template=>"pieui/index/list_#{name}"
  end
end
