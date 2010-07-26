class CreateTeachingProcedureAttachments < ActiveRecord::Migration
  def self.up
    create_table :teaching_procedure_attachments do |t|
      t.integer :procedure_id,:null=>false
      t.integer :entry_id,:null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :teaching_procedure_attachments
  end
end
