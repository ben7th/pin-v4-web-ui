class ImageMarksController < ApplicationController

  before_filter :per_load

  def create
    @image_mark = @entry.image_marks.new(params[:image_mark])
    @image_mark.creator = current_user
    if @image_mark.save
      render_ui do |ui|
        ui.page << %`
          var mark_content = $('image_mark').down('div.self_mark').select('.mark_content').last()
          $('image_mark').down('div.self_mark').select('.mark').last().id = "mark_#{@image_mark.id}"
          mark_content.id = "mark_#{@image_mark.id}_content"
          mark_content.innerHTML = #{@image_mark.content.to_json}
        `
        ui.mplist :insert,@image_mark,:partial=>"image_marks/info_image_mark"
      end
      return
    end
    render :status=>500
  end

  def update
    if @image_mark.update_attributes(params[:image_mark])
      @image_mark.reload
      render_ui do |ui|
        ui.page << %`
          var mark_content = $('image_mark').down('#mark_#{@image_mark.id}_content')
          mark_content.innerHTML = #{@image_mark.content.to_json}
        `
        ui.mplist :update,@image_mark,:partial=>"image_marks/info_image_mark"
      end
      return
    end
    render :status=>500
  end

  def destroy
    @image_mark.destroy
    render_ui do |ui|
      ui.mplist :remove,@image_mark
      ui.page << %`
         $$('.self_mark #mark_#{@image_mark.id}')[0].remove();
         $$('.self_mark #mark_#{@image_mark.id}_content')[0].remove();
      `
    end
  end

  def per_load
    @entry = Entry.find(params[:entry_id]) if params[:entry_id]
    @image_mark = @entry.image_marks.find(params[:id]) if params[:id]
  end
end
