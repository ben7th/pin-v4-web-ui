class AddDefaultAndUsuallyUsedToInstallings < ActiveRecord::Migration
  def self.up
    add_column :installings,:is_default,:boolean
    add_column :installings,:usually_used,:boolean
  end

  def self.down
    remove_column(:installings, :is_default)
    remove_column(:installings, :usually_used)
  end
end
