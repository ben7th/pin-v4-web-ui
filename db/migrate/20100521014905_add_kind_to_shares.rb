class AddKindToShares < ActiveRecord::Migration
  def self.up
    add_column :shares, :kind, :string, :default=>"TALK"
  end

  def self.down
    remove_column(:shares, :kind)
  end
end
