class CreateMessageModelings < ActiveRecord::Migration
  def self.up
    create_table :message_modelings do |t|
      t.integer :model_id,:null=>false
      t.string :model_type,:null=>false
      t.integer :message_id,:null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :message_modelings
  end
end
