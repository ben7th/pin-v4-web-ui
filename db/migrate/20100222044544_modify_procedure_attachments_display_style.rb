class ModifyProcedureAttachmentsDisplayStyle < ActiveRecord::Migration
  def self.up
    change_column_default(:teaching_procedures, :attachments_display_style, :default=>"list")
  end

  def self.down
  end
end
