class DeleteStatusFromConstriantsAndTaskAllocations < ActiveRecord::Migration
  def self.up
    remove_column(:constraints, :status)
    remove_column(:task_allocations, :status)
  end

  def self.down
  end
end
