class AddHostToResourceEntries < ActiveRecord::Migration
  def self.up
    add_column :resource_entries, :host_id, :integer
    add_column :resource_entries, :host_type, :string
  end

  def self.down
  end
end
