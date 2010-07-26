class RemoveReferencesAddEntryIdToProcedure < ActiveRecord::Migration
  def self.up
    drop_table(:teaching_references)
    add_column :teaching_procedures,:entry_id,:integer,:null=>false
  end

  def self.down
  end
end
