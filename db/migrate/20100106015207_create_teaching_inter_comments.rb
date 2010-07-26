class CreateTeachingInterComments < ActiveRecord::Migration
  def self.up
    create_table :teaching_inter_comments do |t|
      t.integer :creator_id,:null=>false
      t.integer :procedure_id,:null=>false
      t.text :subject,:null=>false
      t.timestamps
    end
  end

  def self.down
    drop_table :teaching_inter_comments
  end
end
