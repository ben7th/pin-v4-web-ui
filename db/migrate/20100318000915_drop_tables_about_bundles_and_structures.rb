class DropTablesAboutBundlesAndStructures < ActiveRecord::Migration
  def self.up
    drop_table :group_bundles
    drop_table :structures
    remove_column(:groups, :group_bundle_id)
  end

  def self.down
  end
end
