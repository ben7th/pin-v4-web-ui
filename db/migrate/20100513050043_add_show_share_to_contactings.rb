class AddShowShareToContactings < ActiveRecord::Migration
  def self.up
    add_column :contactings,:show_share,:boolean
  end

  def self.down
  end
end
