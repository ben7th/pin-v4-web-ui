class RenameConstraintsToRequirements < ActiveRecord::Migration
  def self.up
    rename_table :constraints, :requirements
  end

  def self.down
  end
end
