class CreateTeachingLessons < ActiveRecord::Migration
  def self.up
    create_table :teaching_lessons do |t|
      t.string :name,:null=>false
      t.text :subject
      t.boolean :published,:default => false
      t.belongs_to :creator,:null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :teaching_lessons
  end
end
