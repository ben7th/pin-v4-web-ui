
module AttachmentsHelper

  def attachment_box(options)
    file_entry = options[:file_entry]
    render :partial=>'attachments/renders/check_box_attachment',:locals=>{:resource_entry=>file_entry.resource_entry}
  end
end

