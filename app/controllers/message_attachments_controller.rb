class MessageAttachmentsController < ApplicationController

  def create
    params[:entry][:resource_meta][:type] = "FileEntry"
    entry = Entry.new(params[:entry])
    entry.user = current_user
    entry.save!
    str = @template.render :partial=>'messages/parts/check_box_attachment',:locals=>{:entry=>entry}
    render :text=>str
  end
end