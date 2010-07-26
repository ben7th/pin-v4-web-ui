class AddAttachmentsDisplayStyleToTeachingProcedures < ActiveRecord::Migration
  def self.up
    add_column :teaching_procedures,:attachments_display_style,:string,:default=>"nest"
  end

  def self.down
    remove_column(:teaching_procedures, :attachments_display_style)
  end
end
