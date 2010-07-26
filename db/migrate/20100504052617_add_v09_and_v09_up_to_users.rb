class AddV09AndV09UpToUsers < ActiveRecord::Migration
  def self.up
    add_column :users,:v09,:boolean
    add_column :users,:v09_up,:boolean
  end

  def self.down
    remove_column(:users, :v09)
    remove_column(:users, :v09_up)
  end
end
