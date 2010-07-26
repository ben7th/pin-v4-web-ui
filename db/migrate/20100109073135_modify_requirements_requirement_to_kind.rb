class ModifyRequirementsRequirementToKind < ActiveRecord::Migration
  def self.up
    rename_column :requirements, :requirement, :kind
  end

  def self.down
  end
end
