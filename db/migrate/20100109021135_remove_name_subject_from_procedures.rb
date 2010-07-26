class RemoveNameSubjectFromProcedures < ActiveRecord::Migration
  def self.up
    remove_column(:teaching_procedures, :name)
    remove_column(:teaching_procedures, :subject)
  end

  def self.down
  end
end
