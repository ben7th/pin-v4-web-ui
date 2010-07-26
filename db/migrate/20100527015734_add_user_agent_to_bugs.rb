class AddUserAgentToBugs < ActiveRecord::Migration
  def self.up
    add_column :bugs, :user_agent, :string
  end

  def self.down
  end
end
