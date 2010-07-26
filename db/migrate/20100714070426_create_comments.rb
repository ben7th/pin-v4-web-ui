class CreateComments < ActiveRecord::Migration
  def self.up
    create_table :comments do |t|
      t.text :content
      t.integer :creator_id
      t.integer :markable_id
      t.string :markable_type
      t.integer :reply_to
      t.timestamps
    end
  end

  def self.down
    drop_table :comments
  end
end
