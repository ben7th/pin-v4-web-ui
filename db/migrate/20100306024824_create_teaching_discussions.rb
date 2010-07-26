class CreateTeachingDiscussions < ActiveRecord::Migration
  def self.up
    create_table :teaching_discussions do |t|
      t.integer :procedure_id,:null=>false
      t.integer :creator_id,:null=>false
      t.string :title,:null=>false
      t.text :content
      t.timestamps
    end
  end

  def self.down
    drop_table :teaching_discussions
  end
end
