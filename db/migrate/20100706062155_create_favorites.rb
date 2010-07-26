class CreateFavorites < ActiveRecord::Migration
  def self.up
    create_table :favorites do |t|
      t.integer :favorable_id
      t.string :favorable_type
      t.integer :user_id
      t.integer :num
      t.timestamps
    end
  end

  def self.down
    drop_table :favorites
  end
end
