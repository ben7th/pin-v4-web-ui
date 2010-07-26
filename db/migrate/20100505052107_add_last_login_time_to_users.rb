class AddLastLoginTimeToUsers < ActiveRecord::Migration
  def self.up
    add_column :users ,:last_login_time, :datetime
  end

  def self.down
    remove_column :users ,:last_login_time
  end
end
