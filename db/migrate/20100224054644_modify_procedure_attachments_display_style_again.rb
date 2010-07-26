class ModifyProcedureAttachmentsDisplayStyleAgain < ActiveRecord::Migration
  def self.up
    change_column_default(:teaching_procedures, :attachments_display_style, "list")
  end

  def self.down
  end
end
