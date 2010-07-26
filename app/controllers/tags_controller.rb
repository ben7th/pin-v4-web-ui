class TagsController < ApplicationController
  before_filter :per_load,:except=>[:show]

  def index
    @tags = Tag.of_user(current_user).used
  end

  def show
    @tag_values = params[:id].split("+")
    @tags = @tag_values.map{|id|Tag.find_by_value(id)}
    @taggables = @tags.include?(nil) ? [] : Tagging.find_by_tags(@tags)
  end

  def edit
    render_ui do |ui|
      ui.fbox :show,:title=>I18n.t("page.tags.edit_tag"),:partial=>"tags/form_tag",:locals=>{:tag=>@tag}
    end
  end

  def update
    @tag.change_value_to(params[:tag][:value])
    render_ui do |ui|
      ui.page.close_box
      ui.cell(:position=>:paper,:partial=>"tags/cell_index",:locals=>{:tags=>Tag.of_user(current_user).used})
    end
  end

  def merge_form
    if params[:tag_ids]
      render_ui do |ui|
        ui.fbox :show,:title=>I18n.t("page.tags.merge_tag"),:partial=>"tags/form_merge",:locals=>{:tag_ids=>params[:tag_ids] }
      end
      return
    end
    render :text=>""
  end

  def merge
    tags = Tag.find(params[:tag_ids])
    Tag.merge_tags_of_user(tags,params[:value],current_user)
    order_tags = Tag.of_user(current_user).used
    render_ui do |ui|
      ui.page.close_box
      ui.cell(:position=>:paper,:partial=>"tags/cell_index",:locals=>{:tags=>order_tags})
    end
  end

  def per_load
    @taggable = ResourceEntry.find(params[:resource_entry_id]) if params[:resource_entry_id]
    @tag = Tag.find(params[:id]) if params[:id]
  end
end
