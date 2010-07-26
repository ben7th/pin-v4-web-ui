class CreateBugs < ActiveRecord::Migration
  def self.up
    create_table :bugs do |t|
      t.string :kind
      t.string :content
      t.integer :user_id
      t.string :user_ip

      t.string :attachment_file_name
      t.string :attachment_content_type
      t.integer :attachment_file_size
      t.datetime :attachment_updated_at
      
      t.timestamps
    end
  end

  def self.down
    drop_table :bugs
  end
end
