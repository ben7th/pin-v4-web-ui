class AddIndexForParticipatings < ActiveRecord::Migration
  def self.up
    add_index :participatings,:user_id
    add_index :participatings,:message_id
  end

  def self.down
  end
end
