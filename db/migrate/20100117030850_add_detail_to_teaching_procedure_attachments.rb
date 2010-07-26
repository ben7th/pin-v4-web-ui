class AddDetailToTeachingProcedureAttachments < ActiveRecord::Migration
  def self.up
    add_column :teaching_procedure_attachments,:detail,:string,:default=>"Min"
  end

  def self.down
    remove_column(:teaching_procedure_attachments, :detail)
  end
end
