class CreateTeachingHomeworks < ActiveRecord::Migration
  def self.up
    create_table :teaching_homeworks do |t|
      t.integer :procedure_id,:null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :teaching_homeworks
  end
end
