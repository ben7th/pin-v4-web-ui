class CreateAchievementings < ActiveRecord::Migration
  def self.up
    create_table :achievementings do |t|
      t.integer :user_id
      t.integer :achievement_id
      t.timestamps
    end
    add_index :achievementings,:user_id
    add_index :achievementings,:achievement_id
  end

  def self.down
    drop_table :achievementings
  end
end
