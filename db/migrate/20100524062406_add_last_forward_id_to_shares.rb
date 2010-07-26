class AddLastForwardIdToShares < ActiveRecord::Migration
  def self.up
    add_column :shares, :last_forward_id, :integer
  end

  def self.down
  end
end
