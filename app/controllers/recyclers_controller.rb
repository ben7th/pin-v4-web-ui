class RecyclersController < ApplicationController
  
  before_filter :pre_load
  before_filter :is_creator?,:only=>[:recover,:destroy]

  def show
    @recycler = current_user.recycler
  end

  # 恢复元素
  def recover
    @item.recover
    redirect_to :action => :show
  end

  # 删除元素
  def destroy
    @item.destroy!
    redirect_to :action => :show
  end

  # 前置过滤器，恢复元素，删除元素必须是这个元素的创建者
  def is_creator?
    (@item.creator == current_user) ? true : (render :status=>403,:text=>"你想干嘛！删别人的东西啊？打你屁股")
  end

  def pre_load
    @class_name = params[:type] if params[:type]
    @id = params[:id] if params[:id]
    @item = Class.class_eval(@class_name).find_with_deleted(@id) if @class_name&&@id
  end
  
end
