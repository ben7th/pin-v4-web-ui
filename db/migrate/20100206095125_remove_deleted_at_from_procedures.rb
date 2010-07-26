class RemoveDeletedAtFromProcedures < ActiveRecord::Migration
  def self.up
    remove_column(:teaching_procedures, :deleted_at)
  end

  def self.down
  end
end
