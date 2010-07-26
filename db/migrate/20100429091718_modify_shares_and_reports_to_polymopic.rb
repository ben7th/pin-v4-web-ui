class ModifySharesAndReportsToPolymopic < ActiveRecord::Migration
  def self.up
    add_column :shares,:shareable_type,:string
    rename_column(:shares, :entry_id, :shareable_id)
    add_column :reports,:reportable_type,:string
    rename_column(:reports, :entry_id, :reportable_id)
  end

  def self.down
    rename_column(:shares, :shareable_id, :entry_id)
    rename_column(:reports, :reportable_id, :entry_id)
    remove_column(:shares, :shareable_type)
    remove_column(:reports, :reportable_type)
  end
end
