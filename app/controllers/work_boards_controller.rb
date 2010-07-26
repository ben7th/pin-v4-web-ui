class WorkBoardsController < ApplicationController
  before_filter :per_load
  def per_load
    @user = User.find(params[:user_id])
  end

  def show
    @work_board = WorkBoard.find_or_create_by_user_id(@user)
    render :layout=>false
  end
end
