class DeleteTeachingAttachments < ActiveRecord::Migration
  def self.up
    drop_table :teaching_procedure_attachments
  end

  def self.down
  end
end
