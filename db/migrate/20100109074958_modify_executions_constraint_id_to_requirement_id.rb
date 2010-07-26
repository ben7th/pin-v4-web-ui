class ModifyExecutionsConstraintIdToRequirementId < ActiveRecord::Migration
  def self.up
    rename_column(:executions, :constraint_id, :requirement_id)
  end

  def self.down
  end
end
