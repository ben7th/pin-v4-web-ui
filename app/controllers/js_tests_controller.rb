class JsTestsController < ApplicationController
  def index
    page = params[:page]
    render :template=>"/js_tests/#{page}"
  end
end