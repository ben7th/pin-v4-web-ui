class CreateParticipatings < ActiveRecord::Migration
  def self.up
    create_table :participatings do |t|
      t.integer :message_id,:null=>false
      t.integer :user_id,:null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :participatings
  end
end
