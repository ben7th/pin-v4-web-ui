class RemoveUnitIdFromTeachingProcedures < ActiveRecord::Migration
  def self.up
    remove_column :teaching_procedures,:unit_id
  end

  def self.down
  end
end
