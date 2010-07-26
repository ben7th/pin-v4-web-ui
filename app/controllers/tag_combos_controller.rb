class TagCombosController < ApplicationController

  def new
    tags = Tag.tag_values_to_tags current_user,params[:tag_values]*','
    tag_combo = TagCombo.new
    render_ui do |ui|
      ui.fbox :show,:title=>"新建tag_combo",:partial=>"tag_combos/form_tag_combo",:locals=>{:tag_combo=>tag_combo,:tags=>tags}
    end
  end

  def create
    tag_combo = TagCombo.create_with_tags(params,current_user)
    if tag_combo.new_record?
      render_ui do |ui|
        ui.fbox :show,:title=>"新建tag_combo",:partial=>"tag_combos/form_tag_combo",:locals=>{:tag_combo=>tag_combo,:tags=>tag_combo.tags}
      end
      return
    end
    render_ui do |ui|
      ui.page.close_box
    end
  end
  
end
